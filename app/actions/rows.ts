"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { buildRowData, parseColumns, parseRowData } from "@/lib/columns";

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

/** Saves one cell, leaving the row's other values untouched. */
export async function updateCell(
  listId: string,
  rowId: string,
  columnId: string,
  value: string,
) {
  const list = await getOwnedList(listId);
  if (!list) return;

  const columns = parseColumns(list.columns);
  if (!columns.some((c) => c.id === columnId)) return;

  const row = await prisma.row.findFirst({ where: { id: rowId, listId } });
  if (!row) return;

  const data = parseRowData(row.data);
  data[columnId] = value.trim();

  await prisma.row.update({
    where: { id: rowId },
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
