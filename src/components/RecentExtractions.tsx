"use client";

import { DOCUMENT_TYPE_LABELS } from "@/lib/schemas";
import type { RecentExtraction } from "@/lib/types";

export function RecentExtractions({ items }: { items: RecentExtraction[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Extractions from this session will show up here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
        >
          <span className="truncate font-medium text-neutral-800 dark:text-neutral-100">
            {item.label}
          </span>
          <span className="ml-2 shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {DOCUMENT_TYPE_LABELS[item.documentType]}
          </span>
        </li>
      ))}
    </ul>
  );
}
