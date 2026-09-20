import Link from "next/link";
import Form from "next/form";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import ListCard from "@/app/components/ListCard";

export const metadata: Metadata = {
  title: "Dashboard · ListForge",
  description: "All of your lists in one place.",
};

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const userId = await requireUserId();

  const lists = await prisma.list.findMany({
    where: {
      userId,
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }),
    },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { rows: true } } },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your lists</h1>
          <p className="mt-1 text-sm text-muted">
            {query
              ? `${lists.length} ${lists.length === 1 ? "match" : "matches"} for “${query}”`
              : `${lists.length} ${lists.length === 1 ? "list" : "lists"}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Form action="/dashboard" className="flex gap-2">
            <input
              name="q"
              defaultValue={query}
              className="field w-56"
              placeholder="Search lists…"
              aria-label="Search lists"
            />
            <button className="btn-secondary">Search</button>
          </Form>

          <Link href="/lists/new" className="btn-primary">
            New list
          </Link>
        </div>
      </div>

      {lists.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="font-medium">
            {query ? "Nothing matched that search" : "No lists yet"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            {query
              ? "Try a different term, or create a list with that name."
              : "Create your first list and define whichever columns you need."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {query && (
              <Link href="/dashboard" className="btn-secondary">
                Clear search
              </Link>
            )}
            <Link href="/lists/new" className="btn-primary">
              Create a list
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <li key={list.id}>
              <ListCard list={list} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
