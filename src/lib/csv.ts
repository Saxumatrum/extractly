import type { DocumentType, Invoice, Receipt, Resume } from "@/lib/schemas";

/**
 * CSV flattening strategy
 * -----------------------
 * CSV is inherently a flat, two-dimensional format, while our extracted
 * documents contain nested arrays (line items, work experience, etc).
 * We flatten each document type as follows:
 *
 * - Invoice: one row per line item. Invoice-level fields (vendor,
 *   invoiceNumber, date, dueDate, billTo, subtotal, tax, total) are
 *   repeated on every row so each row is fully self-describing.
 * - Receipt: one row per purchased item, with receipt-level fields
 *   (merchant, date, subtotal, tax, total, paymentMethod) repeated on
 *   every row, mirroring the invoice strategy.
 * - Resume: one row per work experience entry, with candidate-level
 *   fields (name, email, phone, location, summary) repeated on every
 *   row. Skills are joined into a single semicolon-separated cell, and
 *   education entries are flattened into a single semicolon-separated
 *   "education" cell (e.g. "B.S. Computer Science, MIT (2018-2022)")
 *   since they don't share a natural row axis with work experience.
 *   If there is no work experience, a single row is still emitted.
 */

type CsvRow = Record<string, string | number | null>;

function rowsForInvoice(invoice: Invoice): CsvRow[] {
  const base = {
    vendor: invoice.vendor,
    invoiceNumber: invoice.invoiceNumber,
    date: invoice.date,
    dueDate: invoice.dueDate,
    billTo: invoice.billTo,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
  };

  if (invoice.lineItems.length === 0) {
    return [
      {
        ...base,
        itemDescription: null,
        itemQuantity: null,
        itemUnitPrice: null,
        itemTotal: null,
      },
    ];
  }

  return invoice.lineItems.map((item) => ({
    ...base,
    itemDescription: item.description,
    itemQuantity: item.quantity,
    itemUnitPrice: item.unitPrice,
    itemTotal: item.total,
  }));
}

function rowsForReceipt(receipt: Receipt): CsvRow[] {
  const base = {
    merchant: receipt.merchant,
    date: receipt.date,
    subtotal: receipt.subtotal,
    tax: receipt.tax,
    total: receipt.total,
    paymentMethod: receipt.paymentMethod,
  };

  if (receipt.items.length === 0) {
    return [{ ...base, itemName: null, itemQuantity: null, itemPrice: null }];
  }

  return receipt.items.map((item) => ({
    ...base,
    itemName: item.name,
    itemQuantity: item.quantity,
    itemPrice: item.price,
  }));
}

function rowsForResume(resume: Resume): CsvRow[] {
  const educationSummary = resume.education
    .map((edu) => {
      const parts = [edu.degree, edu.field, edu.institution].filter(Boolean);
      const range = [edu.startDate, edu.endDate].filter(Boolean).join(" - ");
      return range ? `${parts.join(", ")} (${range})` : parts.join(", ");
    })
    .join("; ");

  const base = {
    name: resume.name,
    email: resume.email,
    phone: resume.phone,
    location: resume.location,
    summary: resume.summary,
    skills: resume.skills.join("; "),
    education: educationSummary || null,
  };

  if (resume.workExperience.length === 0) {
    return [
      {
        ...base,
        company: null,
        title: null,
        startDate: null,
        endDate: null,
        description: null,
      },
    ];
  }

  return resume.workExperience.map((job) => ({
    ...base,
    company: job.company,
    title: job.title,
    startDate: job.startDate,
    endDate: job.endDate,
    description: job.description,
  }));
}

export function rowsForDocument(
  documentType: DocumentType,
  data: Invoice | Receipt | Resume,
): CsvRow[] {
  switch (documentType) {
    case "invoice":
      return rowsForInvoice(data as Invoice);
    case "receipt":
      return rowsForReceipt(data as Receipt);
    case "resume":
      return rowsForResume(data as Resume);
  }
}

function escapeCsvCell(value: string | number | null): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCSV(rows: CsvRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCsvCell(row[h])).join(",")),
  ];
  return lines.join("\r\n");
}

export function documentToCSV(
  documentType: DocumentType,
  data: Invoice | Receipt | Resume,
): string {
  return toCSV(rowsForDocument(documentType, data));
}
