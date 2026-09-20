import type { Metadata } from "next";
import Link from "next/link";

import NewListForm from "@/app/components/NewListForm";

export const metadata: Metadata = {
  title: "New list · ListForge",
  description: "Define your columns and create a list.",
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
        Columns are fixed once the list is created, so sketch them out now.
      </p>

      <div className="mt-8">
        <NewListForm />
      </div>
    </main>
  );
}
