import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { parseColumns } from "@/lib/columns";
import ListHeader from "@/app/components/ListHeader";
import ListRows from "@/app/components/ListRows";

async function getList(id: string) {
  const userId = await requireUserId();

  return prisma.list.findFirst({
    where: { id, userId },
    include: { rows: { orderBy: { position: "asc" } } },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/lists/[id]">): Promise<Metadata> {
  const { id } = await params;
  const list = await getList(id);

  return {
    title: list ? `${list.name} · ListForge` : "List not found · ListForge",
    description: list?.description ?? undefined,
  };
}

export default async function ListDetailPage({
  params,
}: PageProps<"/lists/[id]">) {
  const { id } = await params;
  const list = await getList(id);

  if (!list) notFound();

  const columns = parseColumns(list.columns);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/dashboard"
        className="text-sm text-muted hover:text-foreground"
      >
        ← Dashboard
      </Link>

      <div className="mt-3">
        <ListHeader
          id={list.id}
          name={list.name}
          description={list.description}
          columnCount={columns.length}
          rowCount={list.rows.length}
        />
      </div>

      <div className="mt-6">
        <ListRows
          listId={list.id}
          columns={columns}
          rows={list.rows.map((row) => ({ id: row.id, data: row.data }))}
        />
      </div>
    </main>
  );
}
