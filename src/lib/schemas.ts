import { z } from "zod";

/**
 * The three document types this app supports. Each maps to a distinct
 * zod schema below, used both to prompt the model for structured
 * extraction (via `generateObject`) and to type the client-side
 * editable table / CSV export.
 */
export const DOCUMENT_TYPES = ["invoice", "receipt", "resume"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  invoice: "Invoice",
  receipt: "Receipt",
  resume: "Resume",
};

/* ------------------------------------------------------------------ */
/* Invoice                                                             */
/* ------------------------------------------------------------------ */

export const invoiceLineItemSchema = z.object({
  description: z.string().describe("Description of the line item"),
  quantity: z.number().describe("Quantity billed"),
  unitPrice: z.number().describe("Price per unit"),
  total: z.number().describe("Line item total (quantity * unitPrice)"),
});

export const invoiceSchema = z.object({
  vendor: z.string().describe("Name of the vendor/company issuing the invoice"),
  invoiceNumber: z.string().describe("Invoice number or identifier"),
  date: z.string().describe("Invoice date, as written on the document"),
  dueDate: z
    .string()
    .nullable()
    .describe("Payment due date, if present, otherwise null"),
  billTo: z
    .string()
    .nullable()
    .describe("Name of the customer/recipient being billed, if present"),
  lineItems: z.array(invoiceLineItemSchema).describe("Itemized list of goods/services billed"),
  subtotal: z.number().describe("Subtotal before tax"),
  tax: z.number().describe("Tax amount"),
  total: z.number().describe("Grand total including tax"),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type InvoiceLineItem = z.infer<typeof invoiceLineItemSchema>;

/* ------------------------------------------------------------------ */
/* Receipt                                                             */
/* ------------------------------------------------------------------ */

export const receiptItemSchema = z.object({
  name: z.string().describe("Name of the purchased item"),
  quantity: z.number().describe("Quantity purchased"),
  price: z.number().describe("Price for this item (line total)"),
});

export const receiptSchema = z.object({
  merchant: z.string().describe("Name of the store/merchant"),
  date: z.string().describe("Date of purchase, as written on the receipt"),
  items: z.array(receiptItemSchema).describe("List of purchased items"),
  subtotal: z.number().nullable().describe("Subtotal before tax, if present"),
  tax: z.number().nullable().describe("Tax amount, if present"),
  total: z.number().describe("Total amount paid"),
  paymentMethod: z
    .string()
    .nullable()
    .describe("Payment method used, e.g. Visa, Cash, if present"),
});

export type Receipt = z.infer<typeof receiptSchema>;
export type ReceiptItem = z.infer<typeof receiptItemSchema>;

/* ------------------------------------------------------------------ */
/* Resume                                                              */
/* ------------------------------------------------------------------ */

export const resumeWorkExperienceSchema = z.object({
  company: z.string().describe("Employer/company name"),
  title: z.string().describe("Job title"),
  startDate: z.string().describe("Start date, as written on the resume"),
  endDate: z
    .string()
    .describe("End date, as written on the resume, or 'Present' if current"),
  description: z
    .string()
    .describe("Summary of responsibilities/achievements for this role"),
});

export const resumeEducationSchema = z.object({
  institution: z.string().describe("School/university name"),
  degree: z.string().describe("Degree obtained, e.g. B.S., M.A."),
  field: z.string().nullable().describe("Field of study, if present"),
  startDate: z.string().nullable().describe("Start date, if present"),
  endDate: z.string().nullable().describe("End date/graduation date, if present"),
});

export const resumeSchema = z.object({
  name: z.string().describe("Full name of the candidate"),
  email: z.string().nullable().describe("Email address, if present"),
  phone: z.string().nullable().describe("Phone number, if present"),
  location: z.string().nullable().describe("City/location, if present"),
  summary: z
    .string()
    .nullable()
    .describe("Professional summary/objective statement, if present"),
  skills: z.array(z.string()).describe("List of skills/technologies"),
  workExperience: z
    .array(resumeWorkExperienceSchema)
    .describe("Work history, most recent first"),
  education: z.array(resumeEducationSchema).describe("Education history"),
});

export type Resume = z.infer<typeof resumeSchema>;
export type ResumeWorkExperience = z.infer<typeof resumeWorkExperienceSchema>;
export type ResumeEducation = z.infer<typeof resumeEducationSchema>;

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

export type ExtractedData = Invoice | Receipt | Resume;

export function schemaForDocumentType(documentType: DocumentType) {
  switch (documentType) {
    case "invoice":
      return invoiceSchema;
    case "receipt":
      return receiptSchema;
    case "resume":
      return resumeSchema;
  }
}
