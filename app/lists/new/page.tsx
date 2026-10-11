import type { Metadata } from "next";
import Link from "next/link";

import NewListForm from "@/app/components/NewListForm";

export const metadata: Metadata = {
  title: "New list · ListForge",
  description: "Name your list and start adding columns.",
};

export default function NewListPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">
        ← Dashboard
      </Link>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        Create a list
      </h1>
      <p className="mt-1 text-sm text-muted">
        Give it a name — you&apos;ll add columns on the list page.
      </p>

      <div className="mt-8">
        <NewListForm />
      </div>
    </main>
  );
}
