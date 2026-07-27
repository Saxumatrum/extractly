# extractly

Upload a messy invoice, receipt, or resume (image or PDF) and get back clean,
editable structured JSON — no manual re-typing. This is the classic "pull
structured data out of documents" freelance task, built as a small, real,
working app.

## What it does

1. Pick a document type: **invoice**, **receipt**, or **resume**.
2. Upload a JPG, PNG, WebP, or PDF (drag-and-drop or click to browse).
3. The server sends the file to a vision-capable LLM with a strict Zod
   schema for the chosen document type, using the AI SDK's `generateObject`.
4. The extracted fields render in an editable form/table — fix a typo,
   add a missing line item, remove a bad row, all inline.
5. Export the (edited) result as JSON or CSV.

Everything is stateless per request. There's no database: extracted rows
live only in React state on the client and reset on refresh. The server
also keeps a small in-memory "recent extractions" list (also reset on
restart) purely as a nice-to-have session log.

## Tech stack

- **Next.js 16** (App Router, TypeScript, `src/` layout)
- **Tailwind CSS 4**
- **Vercel AI SDK** (`ai` package) — `generateObject` with Zod schemas for
  structured extraction, multimodal `file` content parts for image/PDF
  input
- **Vercel AI Gateway** — the model is addressed as a plain
  `"anthropic/claude-sonnet-5"` string; `@ai-sdk/anthropic` is used only
  as a direct fallback if you'd rather set `ANTHROPIC_API_KEY` and skip
  the Gateway (see `src/lib/model.ts`)
- **Zod** for schema validation, doubling as the extraction contract for
  the LLM

## Setup

```bash
npm install
cp .env.example .env.local
# then fill in AI_GATEWAY_API_KEY (recommended) or ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without a key set, the upload UI and file handling all work, but the
`/api/extract` call will return a clear 500 error explaining which
environment variable to set — there's no silent failure.

### Available scripts

- `npm run dev` — start the dev server
- `npm run build` — production build (type-checked)
- `npm run lint` — ESLint
- `npm run start` — run the production build

## The three schemas

Defined in `src/lib/schemas.ts`:

- **Invoice** — vendor, invoice number, date, due date, bill-to,
  `lineItems[]` (description/quantity/unitPrice/total), subtotal, tax,
  total.
- **Receipt** — merchant, date, `items[]` (name/quantity/price),
  subtotal, tax, total, payment method.
- **Resume** — name, contact info (email/phone/location), summary,
  `skills[]`, `workExperience[]` (company/title/dates/description),
  `education[]` (institution/degree/field/dates).

Optional fields the model might not find on a given document are typed as
nullable rather than omitted, so the editor always has a stable shape to
render.

## CSV flattening strategy

CSV is flat; these documents aren't. `src/lib/csv.ts` documents and
implements the approach per type:

- **Invoice / Receipt**: one row per line item / purchased item, with the
  document-level fields (vendor, date, totals, etc.) repeated on every
  row so each row is fully self-describing on its own.
- **Resume**: one row per work experience entry, with candidate-level
  fields (name, contact info, skills) repeated per row. Education doesn't
  share a natural row axis with work experience, so it's flattened into a
  single semicolon-separated `education` cell (e.g.
  `"B.S. Computer Science, MIT (2018 - 2022)"`) instead of creating a
  second table.

If a document has zero array entries (e.g. no line items), a single row
with `null` item fields is still emitted so the export is never empty.

## Notes

- File size cap: 15MB. Accepted types: `image/jpeg`, `image/png`,
  `image/webp`, `application/pdf`.
- No API key is bundled — you must supply your own via
  `AI_GATEWAY_API_KEY` or `ANTHROPIC_API_KEY`, so the extraction call
  cannot be exercised without one.
