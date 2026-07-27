"use client";

import type { Receipt, ReceiptItem } from "@/lib/schemas";
import { ArrayTable, NullableTextField, NumberField, TextField } from "./fields";

const ITEM_COLUMNS = [
  { key: "name" as const, label: "Item", type: "text" as const },
  { key: "quantity" as const, label: "Qty", type: "number" as const },
  { key: "price" as const, label: "Price", type: "number" as const },
];

const EMPTY_ITEM: ReceiptItem = { name: "", quantity: 1, price: 0 };

export function ReceiptEditor({
  data,
  onChange,
}: {
  data: Receipt;
  onChange: (data: Receipt) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Merchant"
          value={data.merchant}
          onChange={(v) => onChange({ ...data, merchant: v })}
        />
        <TextField
          label="Date"
          value={data.date}
          onChange={(v) => onChange({ ...data, date: v })}
        />
        <NullableTextField
          label="Payment method"
          value={data.paymentMethod}
          onChange={(v) => onChange({ ...data, paymentMethod: v })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Items
        </h3>
        <ArrayTable
          columns={ITEM_COLUMNS}
          rows={data.items}
          emptyRow={EMPTY_ITEM}
          addLabel="Add item"
          onChange={(items) => onChange({ ...data, items })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          label="Subtotal"
          value={data.subtotal}
          onChange={(v) => onChange({ ...data, subtotal: v })}
        />
        <NumberField
          label="Tax"
          value={data.tax}
          onChange={(v) => onChange({ ...data, tax: v })}
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
