"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { createRows, type AddRowsState } from "@/app/actions/rows";
import {
  MAX_BULK_ROWS,
  inputTypeFor,
  parseJsonRows,
  parseTextRows,
  type Column,
} from "@/lib/columns";

type Mode = "fields" | "text" | "json";

function SubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending || count === 0}>
      {pending ? "Adding…" : `Add ${count} ${count === 1 ? "row" : "rows"}`}
    </button>
  );
}

/** Shared action wiring: runs createRows and calls onAdded after a successful save. */
function useAddRows(onAdded: () => void) {
  return useActionState<AddRowsState, FormData>(async (prev, formData) => {
    const result = await createRows(prev, formData);
    if (result.added) onAdded();
    return result;
  }, {});
}

function Status({ state, hint }: { state: AddRowsState; hint?: string | null }) {
  if (hint) return <span className="text-danger">{hint}</span>;
  if (state.error) return <span className="text-danger">{state.error}</span>;
  if (state.added) {
    return (
      <span className="text-muted">
        Added {state.added} {state.added === 1 ? "row" : "rows"}.
      </span>
    );
  }
  return null;
}

function FieldInput({ column, autoFocus }: { column: Column; autoFocus: boolean }) {
  const name = `col_${column.id}`;

  if (column.type === "select") {
    return (
      <select name={name} className="field" defaultValue="" autoFocus={autoFocus} aria-label={column.name}>
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
      name={name}
      type={inputTypeFor(column.type)}
      className="field"
      placeholder={column.type === "text" ? column.name : undefined}
      autoFocus={autoFocus}
      aria-label={column.name}
    />
  );
}

function FieldsForm({ listId, columns }: { listId: string; columns: Column[] }) {
  const [drafts, setDrafts] = useState(() => [crypto.randomUUID()]);
  const [state, formAction] = useAddRows(() => setDrafts([crypto.randomUUID()]));
  const gridColumns = `repeat(${columns.length}, minmax(9rem, 1fr)) 2rem`;

  return (
    <form action={formAction}>
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="format" value="fields" />

      <div className="overflow-x-auto">
        <div className="grid gap-2" style={{ gridTemplateColumns: gridColumns }}>
          {columns.map((column) => (
            <span key={column.id} className="label mb-0">
              {column.name}
            </span>
          ))}
          <span />

          {drafts.map((key, rowIndex) => (
            <div key={key} className="contents">
              {columns.map((column, i) => (
                <FieldInput
                  key={column.id}
                  column={column}
                  autoFocus={rowIndex === drafts.length - 1 && i === 0}
                />
              ))}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setDrafts((d) => d.filter((k) => k !== key))}
                disabled={drafts.length === 1}
                aria-label="Remove this row"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="mt-3 text-sm text-muted hover:text-accent"
        onClick={() => setDrafts((d) => [...d, crypto.randomUUID()])}
      >
        + Another row
      </button>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm">
          <Status state={state} />
        </p>
        <SubmitButton count={drafts.length} />
      </div>
    </form>
  );
}

function PasteForm({
  listId,
  columns,
  format,
}: {
  listId: string;
  columns: Column[];
  format: "text" | "json";
}) {
  const [text, setText] = useState("");
  const [state, formAction] = useAddRows(() => setText(""));

  const parsed = format === "json" ? parseJsonRows(columns, text) : parseTextRows(columns, text);
  const count = parsed.rows.length;
  const hint =
    parsed.error ?? (count > MAX_BULK_ROWS ? `Max ${MAX_BULK_ROWS} rows at a time.` : null);
  const names = columns.map((c) => c.name);
  const jsonExample = JSON.stringify([Object.fromEntries(names.map((n) => [n, "…"]))], null, 2);

  return (
    <form action={formAction}>
      <input type="hidden" name="listId" value={listId} />
      <input type="hidden" name="format" value={format} />

      <p className="mb-2 text-sm text-muted">
        {format === "json" ? (
          <>An array of objects keyed by column name. Unknown keys are ignored.</>
        ) : (
          <>
            One row per line. Separate values with tabs (paste from a spreadsheet)
            or commas, in this order:{" "}
            <span className="font-medium text-foreground">{names.join(", ")}</span>
          </>
        )}
      </p>

      <textarea
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={format === "json" ? 8 : 6}
        autoFocus
        spellCheck={false}
        className="field font-mono"
        placeholder={format === "json" ? jsonExample : names.join(", ")}
      />

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm">
          <Status state={state} hint={hint} />
        </p>
        <SubmitButton count={hint ? 0 : count} />
      </div>
    </form>
  );
}

const TABS: { mode: Mode; label: string }[] = [
  { mode: "fields", label: "By fields" },
  { mode: "text", label: "By text" },
  { mode: "json", label: "By JSON" },
];

/** Add-row panel; scrolls into view whenever `focusKey` changes. */
export default function AddRowForm({
  listId,
  columns,
  focusKey,
  onClose,
}: {
  listId: string;
  columns: Column[];
  focusKey: number;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("fields");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [focusKey]);

  return (
    <div ref={panelRef} className="card scroll-mt-24 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.mode}
              type="button"
              onClick={() => setMode(tab.mode)}
              className={
                mode === tab.mode
                  ? "rounded-md bg-accent-soft px-3 py-1 text-sm font-medium text-accent"
                  : "rounded-md px-3 py-1 text-sm text-muted hover:text-foreground"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn-ghost" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {mode === "fields" ? (
        <FieldsForm listId={listId} columns={columns} />
      ) : (
        <PasteForm key={mode} listId={listId} columns={columns} format={mode} />
      )}
    </div>
  );
}
