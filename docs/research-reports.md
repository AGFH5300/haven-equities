# Research report publishing steps

Use this guide to add new research reports and PDFs so the site can render the report detail page
without exposing the Supabase file URL.

## 1) Upload the report PDF to Supabase Storage

1. Open the Supabase project for HAVEN Equities.
2. Go to **Storage** → **Buckets** and choose (or create) a bucket for reports.
3. Upload the PDF file (or Word doc if you later export to PDF).
4. Copy the public file URL (or the signed URL if the bucket is private). This URL is stored in
   `research_reports.pdf_url` and will be proxied by the app.

## 2) Add or update the report metadata

1. In Supabase, open **Table Editor** → `research_reports`.
2. Insert a row or edit an existing row with the required fields:
   - `slug` (string): URL-safe ID like `apple-q4-2024`.
   - `company` (string): Company name displayed on the site.
   - `ticker` (string): Stock ticker (e.g., `AAPL`).
   - `sector` (string): One of the sectors used on the site (Technology, Financials, etc.).
   - `cycle` (number): Report cycle number.
   - `analyst` (string): Analyst name.
   - `publish_date` (string/date): Date shown on the report.
   - `summary` (string): Short description used in cards and metadata.
   - `thesis` (string): The educational thesis summary.
   - `key_risks` (array or comma-separated string): Risk bullet list.
   - `sources` (array or comma-separated string): Source citations.
   - `pdf_url` (string): Paste the Supabase storage file URL from step 1.

## 3) Verify the report in the app

1. Navigate to `/research` and confirm the report appears in the library.
2. Open the report detail page at `/research/<slug>`.
3. Confirm the embedded PDF renders full-screen in the iframe. The PDF is delivered through the
   `/api/research/report-pdf/<slug>` proxy route, so the Supabase URL is not exposed.

## Optional: upload via the admin web page (`/system`)

This is the simplest workflow if you want to upload reports directly in the browser.

1. Set these environment variables (server and client):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   REPORTS_BUCKET="reports"
   SYSTEM_ALLOWED_EMAILS="you@example.com,other-admin@example.com"
   ```

2. Visit `/system` and sign in with Google.
3. Only emails listed in `SYSTEM_ALLOWED_EMAILS` can upload reports.
4. Fill in the form and upload the PDF. The server uploads to Supabase Storage and inserts the
   `research_reports` row.

## Optional: upload via the terminal (owner-only)

Use the script below to upload a PDF and insert the report metadata in one step. This requires the
Supabase service role key, so keep it local and never expose it in the browser.

1. Create a `.env.local` with the server-only values:

   ```bash
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   REPORTS_BUCKET="reports"
   ```

2. Run the upload script with report metadata as environment variables:

   ```bash
   REPORT_SLUG="apple-q4-2024" \\
   REPORT_COMPANY="Apple Inc." \\
   REPORT_TICKER="AAPL" \\
   REPORT_SECTOR="Technology" \\
   REPORT_CYCLE="4" \\
   REPORT_ANALYST="Jane Doe" \\
   REPORT_PUBLISH_DATE="2024-10-15" \\
   REPORT_SUMMARY="Apple shows resilient services growth despite hardware headwinds." \\
   REPORT_THESIS="Services expansion and ecosystem stickiness drive durable cash flows." \\
   REPORT_KEY_RISKS="Hardware demand softness|Regulatory pressure on App Store fees|FX headwinds" \\
   REPORT_SOURCES="Apple 10-K 2024|IDC mobile phone tracker|Company earnings call Q4 2024" \\
   node scripts/upload-report.mjs /absolute/path/to/report.pdf
   ```

The script uploads the PDF into `REPORTS_BUCKET/<slug>/` and inserts the report row with the
generated `pdf_url`.
