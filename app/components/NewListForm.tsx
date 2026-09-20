"use client";

import { useActionState, useState } from "react";

import { createList, type ActionState } from "@/app/actions/lists";
import {
  COLUMN_TYPES,
  COLUMN_TYPE_LABELS,
  type ColumnType,
} from "@/lib/columns";

type DraftColumn = {
  id: string;
  name: string;
  type: ColumnType;
  options: string;
};

function newColumn(name = "", type: ColumnType = "text"): DraftColumn {
  return { id: crypto.randomUUID(), name, type, options: "" };
}

const TEMPLATES: { label: string; columns: [string, ColumnType][] }[] = [
  {
    label: "Books",
    columns: [
      ["Title", "text"],
      ["Author", "text"],
      ["Rating", "number"],
    ],
  },
  {
    label: "Job applications",
    columns: [
      ["Company", "text"],
      ["Status", "select"],
      ["Applied on", "date"],
    ],
  },
  {
    label: "Expenses",
    columns: [
      ["Item", "text"],
      ["Amount", "number"],
      ["Date", "date"],
    ],
  },
];

export default function NewListForm() {
  const [columns, setColumns] = useState<DraftColumn[]>([
    newColumn("Name"),
    newColumn(),
  ]);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createList,
    {},
  );

  function update(id: string, patch: Partial<DraftColumn>) {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, ...patch } : col)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= columns.length) return;
    setColumns((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const payload = JSON.stringify(
    columns
      .filter((col) => col.name.trim())
      .map((col) => ({
        id: col.id,
        name: col.name.trim(),
        type: col.type,
        options:
          col.type === "select"
            ? col.options
                .split(",")
                .map((o) => o.trim())
                .filter(Boolean)
            : undefined,
      })),
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="columns" value={payload} />

      <section className="card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">
              List name
            </label>
            <input
              id="name"
              name="name"
              className="field"
              placeholder="Reading list"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="description">
              Description <span className="text-muted">(optional)</span>
            </label>
            <input
              id="description"
              name="description"
              className="field"
              placeholder="Books I want to get through this year"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Start from:</span>
          {TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              className="btn-secondary px-3 py-1"
              onClick={() =>
                setColumns(
                  template.columns.map(([name, type]) => newColumn(name, type)),
                )
              }
            >
              {template.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Columns</h2>
            <p className="text-sm text-muted">
              These become the fields of every row.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setColumns((prev) => [...prev, newColumn()])}
          >
            Add column
          </button>
        </div>

        <ul className="space-y-3">
          {columns.map((column, index) => (
            <li key={column.id} className="rounded-lg border border-line p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-6 text-center text-sm text-muted">
                  {index + 1}
                </span>

                <input
                  className="field flex-1 min-w-40"
                  value={column.name}
                  placeholder="Column name"
                  onChange={(e) => update(column.id, { name: e.target.value })}
                />

                <select
                  className="field w-36"
                  value={column.type}
                  onChange={(e) =>
                    update(column.id, { type: e.target.value as ColumnType })
                  }
                >
                  {COLUMN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {COLUMN_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>

                <div className="flex items-center">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => move(index, 1)}
                    disabled={index === columns.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() =>
                      setColumns((prev) =>
                        prev.filter((c) => c.id !== column.id),
                      )
                    }
                    disabled={columns.length === 1}
                    aria-label="Remove column"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {column.type === "select" && (
                <input
                  className="field mt-2"
                  value={column.options}
                  placeholder="Choices, comma separated — e.g. Applied, Interview, Offer"
                  onChange={(e) =>
                    update(column.id, { options: e.target.value })
                  }
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      {state.error && (
        <p className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button className="btn-primary" disabled={pending}>
          {pending ? "Creating…" : "Create list"}
        </button>
      </div>
    </form>
  );
}
