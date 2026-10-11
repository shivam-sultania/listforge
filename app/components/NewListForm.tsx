"use client";

import { useActionState } from "react";

import { createList, type ActionState } from "@/app/actions/lists";

export default function NewListForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createList,
    {},
  );

  return (
    <form action={formAction} className="space-y-8">
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
