import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log in · ListForge" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-1 text-sm text-muted">
        Authentication isn&apos;t wired up yet — every session uses the demo
        account for now.
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
          Log in
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/dashboard" className="hover:text-foreground">
          Continue to the dashboard →
        </Link>
      </p>
    </main>
  );
}
