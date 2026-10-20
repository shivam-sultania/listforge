"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";

import { deleteRow, updateCell } from "@/app/actions/rows";
import ColumnMenu from "@/app/components/ColumnMenu";
import {
  formatCell,
  inputTypeFor,
  parseRowData,
  type Column,
  type RowData,
} from "@/lib/columns";

type SerializedRow = { id: string; data: string };

type Props = {
  listId: string;
  columns: Column[];
  rows: SerializedRow[];
};

function Cell({ column, value }: { column: Column; value: string }) {
  if (!value) return <span className="text-muted">—</span>;

  if (column.type === "select") {
    return (
      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
        {value}
      </span>
    );
  }

  const text = formatCell(column, value);
  return (
    <span className={column.type === "number" ? "tabular-nums" : undefined}>
      {text}
    </span>
  );
}

/** Click to edit; Enter or clicking away saves, Escape cancels. */
function EditableCell({
  listId,
  rowId,
  column,
  value,
}: {
  listId: string;
  rowId: string;
  column: Column;
  value: string;
}) {
  const [editing, setEditing] = useState(false);
  const [shown, setShown] = useOptimistic(value);
  const [, startTransition] = useTransition();
  const finished = useRef(false);

  function start() {
    finished.current = false;
    setEditing(true);
  }

  function finish(next: string | null) {
    if (finished.current) return;
    finished.current = true;
    setEditing(false);

    if (next === null || next.trim() === value) return;
    startTransition(async () => {
      setShown(next.trim());
      await updateCell(listId, rowId, column.id, next);
    });
  }

  if (editing) {
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (e.key === "Enter") finish(e.currentTarget.value);
      if (e.key === "Escape") finish(null);
    };

    return column.type === "select" ? (
      <select
        autoFocus
        defaultValue={value}
        className="field py-1.5"
        onChange={(e) => finish(e.target.value)}
        onBlur={(e) => finish(e.target.value)}
        onKeyDown={onKeyDown}
      >
        <option value="">—</option>
        {(column.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    ) : (
      <input
        autoFocus
        type={inputTypeFor(column.type)}
        defaultValue={value}
        className="field py-1.5"
        onBlur={(e) => finish(e.target.value)}
        onKeyDown={onKeyDown}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      className="-mx-2 block w-[calc(100%+1rem)] cursor-text rounded-md px-2 py-1 text-left hover:bg-surface hover:ring-1 hover:ring-line"
      aria-label={`Edit ${column.name}`}
    >
      <Cell column={column} value={shown} />
    </button>
  );
}

function DeleteRowButton({ listId, rowId }: { listId: string; rowId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn-danger opacity-0 group-hover:opacity-100 focus:opacity-100"
      disabled={pending}
      aria-label="Delete row"
      onClick={() => {
        if (!confirm("Delete this row?")) return;
        startTransition(() => deleteRow(listId, rowId));
      }}
    >
      ✕
    </button>
  );
}

export default function DataTable({ listId, columns, rows }: Props) {
  const parsed: { id: string; values: RowData }[] = rows.map((row) => ({
    id: row.id,
    values: parseRowData(row.data),
  }));

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left">
            {columns.map((column) => (
              <th
                key={column.id}
                className="px-4 py-3 font-medium whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  {column.name}
                  <span className="ml-1.5 text-xs font-normal text-muted">
                    {column.type}
                  </span>
                  <ColumnMenu listId={listId} column={column} />
                </span>
              </th>
            ))}
            <th className="w-px px-4 py-2 text-right">
              <span className="inline-flex justify-end">
                <ColumnMenu listId={listId} />
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          {parsed.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center"
              >
                <p className="font-medium">
                  {columns.length === 0 ? "No columns yet" : "No rows yet"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {columns.length === 0
                    ? "Use the + button to add your first column."
                    : "Add your first entry using the form below."}
                </p>
              </td>
            </tr>
          )}

          {parsed.map((row) => (
            <tr
              key={row.id}
              className="group border-b border-line last:border-0 hover:bg-accent-soft/40"
            >
              {columns.map((column) => (
                <td key={column.id} className="px-4 py-1.5 align-middle">
                  <EditableCell
                    listId={listId}
                    rowId={row.id}
                    column={column}
                    value={row.values[column.id] ?? ""}
                  />
                </td>
              ))}
              <td className="px-4 py-1.5 text-right">
                <DeleteRowButton listId={listId} rowId={row.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
