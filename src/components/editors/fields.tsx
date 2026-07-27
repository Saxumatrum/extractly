"use client";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  );
}

type NullableTextFieldProps = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
};

export function NullableTextField({
  label,
  value,
  onChange,
  placeholder,
}: NullableTextFieldProps) {
  return (
    <TextField
      label={label}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(v) => onChange(v === "" ? null : v)}
    />
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function TextAreaField({ label, value, onChange }: TextAreaFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
      <textarea
        value={value ?? ""}
        rows={3}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  );
}

type NumberFieldProps = {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
};

export function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-neutral-900 shadow-sm focus:border-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
    </label>
  );
}

type StringListFieldProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export function StringListField({ label, values, onChange }: StringListFieldProps) {
  function updateItem(index: number, value: string) {
    const next = values.slice();
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <div
            key={index}
            className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white pl-3 pr-1 py-1 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <input
              type="text"
              value={value}
              onChange={(e) => updateItem(index, e.target.value)}
              className="w-24 bg-transparent text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-full px-1.5 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-red-600 dark:hover:bg-neutral-800"
              aria-label={`Remove ${value}`}
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="rounded-full border border-dashed border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

export type ColumnDef<T> = {
  key: keyof T;
  label: string;
  type: "text" | "number";
};

type ArrayTableProps<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  onChange: (rows: T[]) => void;
  emptyRow: T;
  addLabel?: string;
};

export function ArrayTable<T extends Record<string, unknown>>({
  columns,
  rows,
  onChange,
  emptyRow,
  addLabel = "Add row",
}: ArrayTableProps<T>) {
  function updateCell(index: number, key: keyof T, value: string) {
    const next = rows.slice();
    const parsed =
      columns.find((c) => c.key === key)?.type === "number"
        ? value === ""
          ? 0
          : Number(value)
        : value;
    next[index] = { ...next[index], [key]: parsed };
    onChange(next);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, { ...emptyRow }]);
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200 dark:border-neutral-800">
      <table className="min-w-full divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-3 py-2 text-left font-medium text-neutral-600 dark:text-neutral-300"
              >
                {col.label}
              </th>
            ))}
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-3 py-4 text-center text-neutral-400"
              >
                No rows yet.
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={String(col.key)} className="px-3 py-1.5">
                  <input
                    type={col.type === "number" ? "number" : "text"}
                    step={col.type === "number" ? "any" : undefined}
                    value={String(row[col.key] ?? "")}
                    onChange={(e) => updateCell(index, col.key, e.target.value)}
                    className="w-full min-w-24 rounded border border-transparent bg-transparent px-2 py-1 hover:border-neutral-300 focus:border-neutral-500 focus:outline-none dark:hover:border-neutral-700"
                  />
                </td>
              ))}
              <td className="px-3 py-1.5 text-right">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <button
          type="button"
          onClick={addRow}
          className="rounded px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          + {addLabel}
        </button>
      </div>
    </div>
  );
}
