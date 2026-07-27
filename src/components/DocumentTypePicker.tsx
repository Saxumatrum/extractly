"use client";

import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, type DocumentType } from "@/lib/schemas";

export function DocumentTypePicker({
  value,
  onChange,
  disabled,
}: {
  value: DocumentType;
  onChange: (value: DocumentType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Document type">
      {DOCUMENT_TYPES.map((type) => {
        const active = type === value;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(type)}
            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-600"
            }`}
          >
            {DOCUMENT_TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}
