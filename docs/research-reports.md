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
