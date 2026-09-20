"use client";

import { useState } from "react";

import { deleteList, updateList } from "@/app/actions/lists";
import DeleteListButton from "@/app/components/DeleteListButton";

type Props = {
  id: string;
  name: string;
  description: string | null;
  columnCount: number;
  rowCount: number;
};

export default function ListHeader({
  id,
  name,
  description,
  columnCount,
  rowCount,
}: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateList(formData);
          setEditing(false);
        }}
        className="card p-5"
      >
        <input type="hidden" name="listId" value={id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="list-name">
              List name
            </label>
            <input
              id="list-name"
              name="name"
              defaultValue={name}
              className="field"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="list-description">
              Description
            </label>
            <input
              id="list-description"
              name="description"
              defaultValue={description ?? ""}
              className="field"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
          <button className="btn-primary">Save changes</button>
        </div>
      </form>
    );
  }

  return (
    <div className="group flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        <p className="mt-2 text-xs text-muted">
          {columnCount} {columnCount === 1 ? "column" : "columns"} · {rowCount}{" "}
          {rowCount === 1 ? "row" : "rows"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setEditing(true)}
        >
          Edit list
        </button>

        <form action={deleteList}>
          <input type="hidden" name="listId" value={id} />
          <DeleteListButton name={name} label="Delete list" />
        </form>
      </div>
    </div>
  );
}
