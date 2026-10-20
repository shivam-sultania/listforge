"use client";

import { useActionState, useRef } from "react";

import { createUser, type CreateUserState } from "@/app/actions/dev";

export default function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<CreateUserState, FormData>(
    async (prev, formData) => {
      const result = await createUser(prev, formData);
      if (result.created) formRef.current?.reset();
      return result;
    },
    {},
  );

  return (
    <form ref={formRef} action={formAction} className="card p-5">
      <h2 className="mb-4 font-semibold">Add a user</h2>

      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_8rem_auto] sm:items-end">
        <div>
          <label className="label" htmlFor="new-email">
            Email
          </label>
          <input id="new-email" name="email" type="email" className="field" required />
        </div>
        <div>
          <label className="label" htmlFor="new-password">
            Password
          </label>
          <input
            id="new-password"
            name="password"
            type="password"
            className="field"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="new-role">
            Role
          </label>
          <select id="new-role" name="role" className="field" defaultValue="USER">
            <option value="USER">User</option>
            <option value="DEV">Dev</option>
          </select>
        </div>
        <button className="btn-primary" disabled={pending}>
          {pending ? "Adding…" : "Add user"}
        </button>
      </div>

      {state.error && <p className="mt-3 text-sm text-danger">{state.error}</p>}
      {state.created && (
        <p className="mt-3 text-sm text-muted">
          Created {state.created}. Share the password with them directly.
        </p>
      )}
    </form>
  );
}
