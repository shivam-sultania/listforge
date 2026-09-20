import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign up · ListForge" };

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
      <p className="mt-1 text-sm text-muted">
        Accounts are coming once auth is in place.
      </p>

      <form className="card mt-8 space-y-4 p-6">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className="field" disabled />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="field"
            disabled
          />
        </div>
        <button className="btn-primary w-full" disabled>
          Create account
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/login" className="hover:text-foreground">
          Already have an account?
        </Link>
      </p>
    </main>
  );
}
