import assert from 'node:assert/strict';
import { stripTypeScriptTypes } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';

const routePath = resolve(import.meta.dirname, '../app/api/system/reports/route.ts');
const originalFetch = globalThis.fetch;

const source = readFileSync(routePath, 'utf8');
const compiled = stripTypeScriptTypes(source, { mode: 'transform' });
const { POST } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

const ENV_VALUES = {
  SUPABASE_URL: 'https://synthetic-supabase.example.invalid',
  NEXT_PUBLIC_SUPABASE_URL: 'https://synthetic-supabase.example.invalid',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'synthetic-anon',
  SUPABASE_SERVICE_ROLE_KEY: 'synthetic-service-role',
  REPORTS_BUCKET: 'synthetic-reports',
  SYSTEM_ALLOWED_EMAILS: 'analyst@example.invalid',
  SYSTEM_GOOGLE_ALLOWLIST: '',
  SYSTEM_GOOGLE_ALLOWED_DOMAINS: '',
};

function makeForm({
  pdf = new File([Buffer.from('%PDF-1.7\nSynthetic PDF fixture\n')], 'report.pdf', { type: 'application/pdf' }),
  slug = 'safe-report',
} = {}) {
  const form = new FormData();
  form.set('pdf', pdf);
  form.set('slug', slug);
  form.set('company', 'Synthetic Research Company');
  form.set('ticker', 'TST');
  form.set('sector', 'Technology');
  form.set('cycle', '3');
  form.set('analyst', 'Synthetic Analyst');
  form.set('publish_date', '2026-01-02');
  form.set('summary', 'Test fixture only');
  form.set('thesis', 'Test fixture only');
  form.set('key_risks', 'Only synthetic risk');
  form.set('sources', 'https://example.invalid');
  return form;
}

async function requestRoute({ form = makeForm(), token = 'synthetic-bearer', contentLength } = {}) {
  const oldEnv = Object.fromEntries(Object.keys(ENV_VALUES).map(k => [k, process.env[k]]));
  for (const [key, value] of Object.entries(ENV_VALUES)) process.env[key] = value;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const address = String(url);
    calls.push({ url: address, method: options.method || 'GET', body: options.body });
    if (address.endsWith('/auth/v1/user')) {
      return Response.json({ email: 'analyst@example.invalid' });
    }
    if (address.includes('/storage/v1/object/')) {
      return new Response(null, { status: 200 });
    }
    if (address.endsWith('/rest/v1/research_reports')) {
      return Response.json([{ slug: 'safe-report' }], { status: 201 });
    }
    throw new Error('Unexpected external request: ' + address);
  };
  try {
    const headers = { Authorization: `Bearer ${token}` };
    if (contentLength !== undefined) headers['Content-Length'] = String(contentLength);
    const request = new Request('http://localhost/api/system/reports', {
      method: 'POST',
      headers,
      body: form,
    });
    const response = await POST(request);
    return { status: response.status, json: await response.json(), calls };
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(oldEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('forged-small Content-Length cannot bypass the streamed 12 MiB multipart body limit', async () => {
  const huge = new File([
    Buffer.from('%PDF-1.7\n'),
    Buffer.alloc(13 * 1024 * 1024, 0x41),
  ], 'huge.pdf', { type: 'application/pdf' });
  const result = await requestRoute({ form: makeForm({ pdf: huge }), contentLength: 10 });
  assert.equal(result.status, 413);
  assert.equal(result.calls.filter(x => x.url.includes('/storage/v1/object/')).length, 0);
  assert.equal(result.calls.filter(x => x.url.includes('/rest/v1/research_reports')).length, 0);
});

test('HTML disguised as a PDF is rejected before any service-role storage mutation', async () => {
  const fakePdf = new File([Buffer.from('<!doctype html><title>Synthetic only</title>')], 'report.pdf', {
    type: 'application/pdf',
  });
  const result = await requestRoute({ form: makeForm({ pdf: fakePdf }) });
  assert.equal(result.status, 400);
  assert.equal(result.calls.filter(x => x.url.includes('/storage/v1/object/')).length, 0);
});

test('path-shaped slugs cannot change privileged object storage paths', async () => {
  const result = await requestRoute({ form: makeForm({ slug: '../other-report' }) });
  assert.equal(result.status, 400);
  assert.equal(result.calls.filter(x => x.url.includes('/storage/v1/object/')).length, 0);
});

test('an allowed synthetic analyst can still submit a small, valid report', async () => {
  const result = await requestRoute();
  assert.equal(result.status, 200);
  assert.equal(result.calls.filter(x => x.url.includes('/storage/v1/object/')).length, 1);
  assert.equal(result.calls.filter(x => x.url.includes('/rest/v1/research_reports')).length, 1);
  assert.match(result.json.pdfUrl, /\/safe-report\/report\.pdf$/);
});

test('missing bearer authentication is rejected before any provider request', async () => {
  const result = await requestRoute({ token: '' });
  assert.equal(result.status, 401);
  assert.equal(result.calls.length, 0);
});
