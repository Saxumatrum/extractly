"use client";

import type { Invoice, InvoiceLineItem } from "@/lib/schemas";
import { ArrayTable, NullableTextField, NumberField, TextField } from "./fields";

const LINE_ITEM_COLUMNS = [
  { key: "description" as const, label: "Description", type: "text" as const },
  { key: "quantity" as const, label: "Qty", type: "number" as const },
  { key: "unitPrice" as const, label: "Unit price", type: "number" as const },
  { key: "total" as const, label: "Total", type: "number" as const },
];

const EMPTY_LINE_ITEM: InvoiceLineItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  total: 0,
};

export function InvoiceEditor({
  data,
  onChange,
}: {
  data: Invoice;
  onChange: (data: Invoice) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Vendor"
          value={data.vendor}
          onChange={(v) => onChange({ ...data, vendor: v })}
        />
        <TextField
          label="Invoice number"
          value={data.invoiceNumber}
          onChange={(v) => onChange({ ...data, invoiceNumber: v })}
        />
        <TextField
          label="Date"
          value={data.date}
          onChange={(v) => onChange({ ...data, date: v })}
        />
        <NullableTextField
          label="Due date"
          value={data.dueDate}
          onChange={(v) => onChange({ ...data, dueDate: v })}
        />
        <NullableTextField
          label="Bill to"
          value={data.billTo}
          onChange={(v) => onChange({ ...data, billTo: v })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Line items
        </h3>
        <ArrayTable
          columns={LINE_ITEM_COLUMNS}
          rows={data.lineItems}
          emptyRow={EMPTY_LINE_ITEM}
          addLabel="Add line item"
          onChange={(lineItems) => onChange({ ...data, lineItems })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          label="Subtotal"
          value={data.subtotal}
          onChange={(v) => onChange({ ...data, subtotal: v ?? 0 })}
        />
        <NumberField
          label="Tax"
          value={data.tax}
          onChange={(v) => onChange({ ...data, tax: v ?? 0 })}
        />
        <NumberField
          label="Total"
          value={data.total}
          onChange={(v) => onChange({ ...data, total: v ?? 0 })}
        />
      </div>
    </div>
  );
}
