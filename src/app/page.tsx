"use client";

import { useEffect, useState } from "react";
import { DocumentTypePicker } from "@/components/DocumentTypePicker";
import { Dropzone } from "@/components/Dropzone";
import { ExportButtons } from "@/components/ExportButtons";
import { RecentExtractions } from "@/components/RecentExtractions";
import { InvoiceEditor } from "@/components/editors/InvoiceEditor";
import { ReceiptEditor } from "@/components/editors/ReceiptEditor";
import { ResumeEditor } from "@/components/editors/ResumeEditor";
import { DOCUMENT_TYPE_LABELS, type DocumentType } from "@/lib/schemas";
import type { ExtractionResult, RecentExtraction } from "@/lib/types";

type Status = "idle" | "loading" | "error";

export default function Home() {
  const [documentType, setDocumentType] = useState<DocumentType>("invoice");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [recent, setRecent] = useState<RecentExtraction[]>([]);

  useEffect(() => {
    fetch("/api/extract")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body?.recent) setRecent(body.recent);
      })
      .catch(() => {
        // Non-critical: the recent-extractions panel is a nice-to-have.
      });
  }, []);

  function handleDocumentTypeChange(next: DocumentType) {
    setDocumentType(next);
    setResult(null);
    setErrorMessage(null);
  }

  function handleFileSelected(next: File | null) {
    setFile(next);
    setResult(null);
    setErrorMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Extraction failed.");
      }

      setResult({ documentType, data: body.data } as ExtractionResult);
      setRecent((prev) => [
        { id: body.id, documentType, label: body.data?.vendor ?? body.data?.merchant ?? body.data?.name ?? DOCUMENT_TYPE_LABELS[documentType], createdAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 20));
      setStatus("idle");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Extraction failed.");
      setStatus("idle");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className="min-h-full bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            extractly
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Turn messy invoices, receipts, and resumes into clean structured data.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
          <div className="flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Document type
                </span>
                <DocumentTypePicker
                  value={documentType}
                  onChange={handleDocumentTypeChange}
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Document
                </span>
                <Dropzone file={file} onFileSelected={handleFileSelected} disabled={isLoading} />
              </div>

              <button
                type="submit"
                disabled={!file || isLoading}
                className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {isLoading ? "Extracting…" : "Extract data"}
              </button>

              {errorMessage && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                  {errorMessage}
                </p>
              )}
            </form>

            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                Recent extractions
              </h2>
              <RecentExtractions items={recent} />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            {isLoading && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-neutral-500 dark:text-neutral-400">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
                <p className="text-sm">Reading document and extracting fields…</p>
              </div>
            )}

            {!isLoading && !result && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20 text-center text-neutral-400">
                <p className="text-sm">
                  Upload a {DOCUMENT_TYPE_LABELS[documentType].toLowerCase()} to see extracted
                  fields here.
                </p>
              </div>
            )}

            {!isLoading && result && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {DOCUMENT_TYPE_LABELS[result.documentType]} — edit before exporting
                  </h2>
                  <ExportButtons documentType={result.documentType} data={result.data} />
                </div>
                {result.documentType === "invoice" && (
                  <InvoiceEditor
                    data={result.data}
                    onChange={(data) => setResult({ documentType: "invoice", data })}
                  />
                )}
                {result.documentType === "receipt" && (
                  <ReceiptEditor
                    data={result.data}
                    onChange={(data) => setResult({ documentType: "receipt", data })}
                  />
                )}
                {result.documentType === "resume" && (
                  <ResumeEditor
                    data={result.data}
                    onChange={(data) => setResult({ documentType: "resume", data })}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
