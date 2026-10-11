"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  addColumn,
  deleteColumn,
  updateColumn,
  type ActionState,
} from "@/app/actions/lists";
import {
  COLUMN_TYPES,
  COLUMN_TYPE_LABELS,
  type Column,
  type ColumnType,
} from "@/lib/columns";

const PANEL_WIDTH = 288;

type Props = {
  listId: string;
  /** Omit to render the "+" add-column button. */
  column?: Column;
};

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M11.5 2.5l2 2L6 12H4v-2l7.5-7.5z" strokeLinejoin="round" />
    </svg>
  );
}

export default function ColumnMenu({ listId, column }: Props) {
  const isEdit = Boolean(column);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [type, setType] = useState<ColumnType>(column?.type ?? "text");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await (isEdit ? updateColumn : addColumn)(prev, formData);
      if (!result.error) setOpen(false);
      return result;
    },
    {},
  );

  function toggle() {
    if (open) return setOpen(false);
    const rect = buttonRef.current!.getBoundingClientRect();
    const left = Math.min(
      Math.max(16, isEdit ? rect.left : rect.right - PANEL_WIDTH),
      window.innerWidth - PANEL_WIDTH - 16,
    );
    setPosition({ top: rect.bottom + 6, left });
    setType(column?.type ?? "text");
    setOpen(true);
  }

  // Close on outside click, Escape, or scroll (the panel is fixed-positioned).
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll(e: Event) {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className={
          isEdit
            ? "ml-1 rounded p-1 text-muted hover:bg-accent-soft hover:text-accent"
            : "grid size-7 place-items-center rounded-md border border-line text-base leading-none text-muted hover:border-accent hover:bg-accent-soft hover:text-accent"
        }
        aria-label={isEdit ? `Edit column ${column!.name}` : "Add column"}
        aria-expanded={open}
      >
        {isEdit ? <PencilIcon /> : "+"}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="card fixed z-50 p-4 text-left font-normal shadow-lg"
          style={{ top: position.top, left: position.left, width: PANEL_WIDTH }}
        >
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="listId" value={listId} />
            {column && <input type="hidden" name="columnId" value={column.id} />}

            <p className="text-sm font-semibold">
              {isEdit ? "Edit column" : "New column"}
            </p>

            <div>
              <label className="label" htmlFor="column-name">
                Name
              </label>
              <input
                id="column-name"
                name="name"
                className="field"
                defaultValue={column?.name}
                placeholder="e.g. Priority"
                autoFocus
                required
              />
            </div>

            {!isEdit && (
              <div>
                <label className="label" htmlFor="column-type">
                  Type
                </label>
                <select
                  id="column-type"
                  name="type"
                  className="field"
                  value={type}
                  onChange={(e) => setType(e.target.value as ColumnType)}
                >
                  {COLUMN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {COLUMN_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {type === "select" && (
              <div>
                <label className="label" htmlFor="column-options">
                  Choices
                </label>
                <input
                  id="column-options"
                  name="options"
                  className="field"
                  defaultValue={column?.options?.join(", ")}
                  placeholder="Applied, Interview, Offer"
                />
              </div>
            )}

            {state.error && <p className="text-sm text-danger">{state.error}</p>}

            <div className="flex items-center justify-between gap-2 pt-1">
              {isEdit ? (
                <button
                  className="btn-danger"
                  formAction={async (formData) => {
                    await deleteColumn(formData);
                    setOpen(false);
                  }}
                  formNoValidate
                  onClick={(e) => {
                    if (!confirm(`Delete the "${column!.name}" column?`)) e.preventDefault();
                  }}
                >
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-1">
                <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="btn-primary px-3 py-1.5" disabled={pending}>
                  {pending ? "Saving…" : isEdit ? "Save" : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
