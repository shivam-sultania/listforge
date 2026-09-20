"use client";

import { useState } from "react";

import { deleteRow, updateRow } from "@/app/actions/rows";
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

function CellInput({
  column,
  value,
  formId,
}: {
  column: Column;
  value: string;
  formId: string;
}) {
  const name = `col_${column.id}`;

  if (column.type === "select") {
    return (
      <select
        form={formId}
        name={name}
        defaultValue={value}
        className="field py-1.5"
      >
        <option value="">—</option>
        {(column.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      form={formId}
      name={name}
      type={inputTypeFor(column.type)}
      defaultValue={value}
      className="field py-1.5"
    />
  );
}

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

export default function DataTable({ listId, columns, rows }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const parsed: { id: string; values: RowData }[] = rows.map((row) => ({
    id: row.id,
    values: parseRowData(row.data),
  }));

  if (parsed.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="font-medium">No rows yet</p>
        <p className="mt-1 text-sm text-muted">
          Add your first entry using the form below.
        </p>
      </div>
    );
  }

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
                {column.name}
                <span className="ml-1.5 text-xs font-normal text-muted">
                  {column.type}
                </span>
              </th>
            ))}
            <th className="w-px px-4 py-3" />
          </tr>
        </thead>

        <tbody>
          {parsed.map((row) => {
            const isEditing = editingId === row.id;

            return (
              <tr
                key={row.id}
                className="border-b border-line last:border-0 hover:bg-accent-soft/40"
              >
                {columns.map((column) => (
                  <td key={column.id} className="px-4 py-2.5 align-middle">
                    {isEditing ? (
                      <CellInput
                        column={column}
                        value={row.values[column.id] ?? ""}
                        formId={`edit-${row.id}`}
                      />
                    ) : (
                      <Cell
                        column={column}
                        value={row.values[column.id] ?? ""}
                      />
                    )}
                  </td>
                ))}

                <td className="px-4 py-2.5 whitespace-nowrap">
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <button
                        form={`edit-${row.id}`}
                        className="btn-primary px-3 py-1"
                        onClick={() => setEditingId(null)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setEditingId(row.id)}
                      >
                        Edit
                      </button>
                      <button
                        form={`delete-${row.id}`}
                        className="btn-danger"
                        onClick={(e) => {
                          if (!confirm("Delete this row?")) e.preventDefault();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Forms live outside the table; inputs above bind to them via form="" */}
      {parsed.map((row) => (
        <div key={row.id} className="hidden">
          <form id={`edit-${row.id}`} action={updateRow}>
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="rowId" value={row.id} />
          </form>
          <form id={`delete-${row.id}`} action={deleteRow}>
            <input type="hidden" name="listId" value={listId} />
            <input type="hidden" name="rowId" value={row.id} />
          </form>
        </div>
      ))}
    </div>
  );
}
