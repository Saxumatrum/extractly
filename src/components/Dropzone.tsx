"use client";

import { useRef, useState } from "react";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";

export function Dropzone({
  file,
  onFileSelected,
  disabled,
}: {
  file: File | null;
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    const selected = fileList?.[0];
    onFileSelected(selected ?? null);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
      }}
      aria-disabled={disabled}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${
        isDragging
          ? "border-neutral-900 bg-neutral-50 dark:border-white dark:bg-neutral-900"
          : "border-neutral-300 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        disabled={disabled}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {file ? (
        <>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {file.name}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {(file.size / 1024).toFixed(0)} KB &middot; click or drop to replace
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Drop a document here, or click to browse
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            JPG, PNG, WebP, or PDF &middot; up to 15MB
          </p>
        </>
      )}
    </div>
  );
}
