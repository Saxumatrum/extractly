"use client";

import { documentToCSV } from "@/lib/csv";
import type { DocumentType, Invoice, Receipt, Resume } from "@/lib/schemas";

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportButtons({
  documentType,
  data,
}: {
  documentType: DocumentType;
  data: Invoice | Receipt | Resume;
}) {
  function exportJSON() {
    downloadBlob(
      JSON.stringify(data, null, 2),
      `${documentType}-extraction.json`,
      "application/json",
    );
  }

  function exportCSV() {
    downloadBlob(documentToCSV(documentType, data), `${documentType}-extraction.csv`, "text/csv");
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={exportJSON}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Export JSON
      </button>
      <button
        type="button"
        onClick={exportCSV}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Export CSV
      </button>
    </div>
  );
}
