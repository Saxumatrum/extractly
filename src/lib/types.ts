import type { Invoice, Receipt, Resume, DocumentType } from "@/lib/schemas";

/**
 * A single entry in the in-memory "recent extractions" list surfaced by
 * the server (see `src/app/api/extract/route.ts`). Shared between the
 * API route and the client component that renders the list.
 */
export type RecentExtraction = {
  id: string;
  documentType: DocumentType;
  label: string;
  createdAt: string;
};

/**
 * Discriminated union tying a document type to its matching extracted
 * shape, used to keep the client-side editor and export logic type-safe.
 */
export type ExtractionResult =
  | { documentType: "invoice"; data: Invoice }
  | { documentType: "receipt"; data: Receipt }
  | { documentType: "resume"; data: Resume };
