import type { Invoice, Receipt, Resume, DocumentType } from "@/lib/schemas";

/**
 * A single entry in the "recent extractions" list. It lives only in the
 * visitor's browser for the current session; the server stores nothing.
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
