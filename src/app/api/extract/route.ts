import { generateObject, NoObjectGeneratedError } from "ai";
import { NextResponse } from "next/server";
import { resolveModel } from "@/lib/model";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  schemaForDocumentType,
  type DocumentType,
} from "@/lib/schemas";
import type { RecentExtraction } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB
const ACCEPTED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const PROMPT_BY_TYPE: Record<DocumentType, string> = {
  invoice:
    "Extract structured data from this invoice. Capture every line item exactly as printed. If a field is not present on the document, use null (or an empty array for list fields). Do not invent data.",
  receipt:
    "Extract structured data from this receipt. Capture every purchased item exactly as printed. If a field is not present on the document, use null (or an empty array for list fields). Do not invent data.",
  resume:
    "Extract structured data from this resume/CV. Capture all work experience and education entries in the order they appear (most recent first if ordering is evident). If a field is not present, use null (or an empty array for list fields). Do not invent data.",
};

/**
 * In-memory list of recent extractions, for the optional "recent
 * extractions" panel in the UI. This is intentionally process-local and
 * resets on server restart -- there is no database in this project.
 */
const MAX_RECENT = 20;
const recentExtractions: RecentExtraction[] = [];

export async function GET() {
  return NextResponse.json({ recent: recentExtractions });
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data." },
      { status: 400 },
    );
  }

  const documentTypeRaw = formData.get("documentType");
  const file = formData.get("file");

  if (typeof documentTypeRaw !== "string") {
    return NextResponse.json(
      { error: "Missing documentType field." },
      { status: 400 },
    );
  }
  const documentType = documentTypeRaw as DocumentType;
  if (!DOCUMENT_TYPES.includes(documentType)) {
    return NextResponse.json(
      { error: `Invalid documentType. Expected one of: ${DOCUMENT_TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Maximum size is 15MB." },
      { status: 400 },
    );
  }

  const mediaType = file.type || "application/octet-stream";
  if (!ACCEPTED_MEDIA_TYPES.has(mediaType)) {
    return NextResponse.json(
      { error: `Unsupported file type "${mediaType}". Upload a JPG, PNG, WebP, or PDF.` },
      { status: 400 },
    );
  }

  let model;
  try {
    model = resolveModel();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Model configuration error." },
      { status: 500 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const schema = schemaForDocumentType(documentType);

  try {
    const { object } = await generateObject({
      model,
      schema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT_BY_TYPE[documentType] },
            {
              type: "file",
              mediaType,
              data: buffer,
              filename: file.name || undefined,
            },
          ],
        },
      ],
    });

    const entry: RecentExtraction = {
      id: crypto.randomUUID(),
      documentType,
      label: extractionLabel(documentType, object),
      createdAt: new Date().toISOString(),
    };
    recentExtractions.unshift(entry);
    recentExtractions.length = Math.min(recentExtractions.length, MAX_RECENT);

    return NextResponse.json({ id: entry.id, documentType, data: object });
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      return NextResponse.json(
        {
          error:
            "The model could not extract structured data from this document. Try a clearer image or a different file.",
        },
        { status: 422 },
      );
    }
    console.error("Extraction failed:", error);
    return NextResponse.json(
      { error: "Extraction failed. Please try again." },
      { status: 500 },
    );
  }
}

function extractionLabel(documentType: DocumentType, object: unknown): string {
  const record = object as Record<string, unknown>;
  const fallback = DOCUMENT_TYPE_LABELS[documentType];
  switch (documentType) {
    case "invoice":
      return typeof record.vendor === "string" && record.vendor ? record.vendor : fallback;
    case "receipt":
      return typeof record.merchant === "string" && record.merchant
        ? record.merchant
        : fallback;
    case "resume":
      return typeof record.name === "string" && record.name ? record.name : fallback;
    default:
      return fallback;
  }
}
