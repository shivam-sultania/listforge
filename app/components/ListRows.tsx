"use client";

import { useState } from "react";

import AddRowForm from "@/app/components/AddRowForm";
import DataTable from "@/app/components/DataTable";
import type { Column } from "@/lib/columns";

type Props = {
  listId: string;
  columns: Column[];
  rows: { id: string; data: string }[];
};

type Placement = "top" | "bottom";

/** The table plus its add-row panel: the top button opens it above the table, the + below it. */
export default function ListRows({ listId, columns, rows }: Props) {
  const [openAt, setOpenAt] = useState<Placement | null>(null);
  const [focusKey, setFocusKey] = useState(0);
  const canAdd = columns.length > 0;

  function openForm(placement: Placement) {
    setOpenAt(placement);
    setFocusKey((k) => k + 1);
  }

  const form = (
    <AddRowForm
      listId={listId}
      columns={columns}
      focusKey={focusKey}
      onClose={() => setOpenAt(null)}
    />
  );

  return (
    <div className="space-y-3">
      {canAdd && openAt !== "top" && (
        <div className="flex justify-end">
          <button
            type="button"
            className="btn-secondary px-3 py-1.5"
            onClick={() => openForm("top")}
          >
            + Add row
          </button>
        </div>
      )}

      {canAdd && openAt === "top" && form}

      <DataTable listId={listId} columns={columns} rows={rows} />

      {canAdd &&
        (openAt === "bottom" ? (
          form
        ) : (
          <button
            type="button"
            onClick={() => openForm("bottom")}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-transparent py-2 text-sm text-muted/60 transition-colors hover:border-line hover:bg-surface hover:text-accent"
            aria-label="Add row"
          >
            <span className="text-lg leading-none">+</span>
            <span className="opacity-0 transition-opacity group-hover:opacity-100">
              Add row
            </span>
          </button>
        ))}
    </div>
  );
}
