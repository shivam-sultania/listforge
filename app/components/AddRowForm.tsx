"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";

import { createRow } from "@/app/actions/rows";
import { inputTypeFor, type Column } from "@/lib/columns";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? "Adding…" : "Add row"}
    </button>
  );
}

export default function AddRowForm({
  listId,
  columns,
}: {
  listId: string;
  columns: Column[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createRow(formData);
        formRef.current?.reset();
      }}
      className="card p-5"
    >
      <h2 className="mb-4 font-semibold">Add a row</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <input type="hidden" name="listId" value={listId} />

        {columns.map((column) => (
          <div key={column.id}>
            <label className="label" htmlFor={`new_${column.id}`}>
              {column.name}
            </label>

            {column.type === "select" ? (
              <select
                id={`new_${column.id}`}
                name={`col_${column.id}`}
                className="field"
                defaultValue=""
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
                id={`new_${column.id}`}
                name={`col_${column.id}`}
                type={inputTypeFor(column.type)}
                className="field"
                placeholder={column.type === "text" ? column.name : undefined}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
