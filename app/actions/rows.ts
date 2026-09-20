"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { buildRowData, parseColumns } from "@/lib/columns";

/** Loads a list only if the current user owns it. */
async function getOwnedList(listId: string) {
  const userId = await requireUserId();
  return prisma.list.findFirst({ where: { id: listId, userId } });
}

export async function createRow(formData: FormData) {
  const listId = String(formData.get("listId") ?? "");
  const list = await getOwnedList(listId);
  if (!list) return;

  const columns = parseColumns(list.columns);
  const data = buildRowData(columns, formData);

  const last = await prisma.row.findFirst({
    where: { listId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.row.create({
    data: {
      listId,
      data: JSON.stringify(data),
      position: (last?.position ?? -1) + 1,
    },
  });

  revalidatePath(`/lists/${listId}`);
}

export async function updateRow(formData: FormData) {
  const listId = String(formData.get("listId") ?? "");
  const rowId = String(formData.get("rowId") ?? "");

  const list = await getOwnedList(listId);
  if (!list) return;

  const columns = parseColumns(list.columns);
  const data = buildRowData(columns, formData);

  await prisma.row.updateMany({
    where: { id: rowId, listId },
    data: { data: JSON.stringify(data) },
  });

  revalidatePath(`/lists/${listId}`);
}

export async function deleteRow(formData: FormData) {
  const listId = String(formData.get("listId") ?? "");
  const rowId = String(formData.get("rowId") ?? "");

  const list = await getOwnedList(listId);
  if (!list) return;

  await prisma.row.deleteMany({ where: { id: rowId, listId } });

  revalidatePath(`/lists/${listId}`);
}
