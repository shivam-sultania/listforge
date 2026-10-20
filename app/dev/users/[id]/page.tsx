import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireDev } from "@/lib/auth";
import { formatCell, parseColumns, parseRowData } from "@/lib/columns";

export const metadata: Metadata = { title: "User · Dev portal · ListForge" };

export default async function DevUserPage({
  params,
}: PageProps<"/dev/users/[id]">) {
  await requireDev();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      email: true,
      role: true,
      lists: {
        orderBy: { updatedAt: "desc" },
        include: { rows: { orderBy: { position: "asc" } } },
      },
    },
  });

  if (!user) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/dev" className="text-sm text-muted hover:text-foreground">
        ← Dev portal
      </Link>

      <h1 className="mt-3 text-2xl font-semibold tracking-tight">{user.email}</h1>
      <p className="mt-1 text-sm text-muted">
        {user.role === "DEV" ? "Dev" : "User"} · {user.lists.length}{" "}
        {user.lists.length === 1 ? "list" : "lists"} · read-only view
      </p>

      <div className="mt-8 space-y-8">
        {user.lists.length === 0 && (
          <div className="card p-10 text-center text-sm text-muted">
            This user has no lists yet.
          </div>
        )}

        {user.lists.map((list) => {
          const columns = parseColumns(list.columns);

          return (
            <section key={list.id}>
              <h2 className="font-semibold">{list.name}</h2>
              {list.description && (
                <p className="text-sm text-muted">{list.description}</p>
              )}

              <div className="card mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      {columns.map((column) => (
                        <th key={column.id} className="px-4 py-3 font-medium whitespace-nowrap">
                          {column.name}
                          <span className="ml-1.5 text-xs font-normal text-muted">
                            {column.type}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {list.rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={Math.max(columns.length, 1)}
                          className="px-4 py-6 text-center text-muted"
                        >
                          No rows
                        </td>
                      </tr>
                    )}
                    {list.rows.map((row) => {
                      const values = parseRowData(row.data);
                      return (
                        <tr key={row.id} className="border-b border-line last:border-0">
                          {columns.map((column) => (
                            <td key={column.id} className="px-4 py-2.5">
                              {formatCell(column, values[column.id] ?? "") || (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
