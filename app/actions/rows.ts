"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getOwnedList } from "@/lib/lists";
import {
  MAX_BULK_ROWS,
  parseColumns,
  parseFieldRows,
  parseJsonRows,
  parseRowData,
  parseTextRows,
  type ParsedRows,
} from "@/lib/columns";

export type AddRowsState = { error?: string; added?: number };

/** Adds rows from any of the three add-row formats: "fields", "text" or "json". */
export async function createRows(
  _prev: AddRowsState,
  formData: FormData,
): Promise<AddRowsState> {
  const listId = String(formData.get("listId") ?? "");
  const list = await getOwnedList(listId);
  if (!list) return { error: "List not found." };

  const columns = parseColumns(list.columns);
  const format = formData.get("format");
  const text = String(formData.get("text") ?? "");

  const parsed: ParsedRows =
    format === "json"
      ? parseJsonRows(columns, text)
      : format === "text"
        ? parseTextRows(columns, text)
        : parseFieldRows(columns, formData);

  if (parsed.error) return { error: parsed.error };
  const rows = parsed.rows;
  if (rows.length === 0) return { error: "Fill in at least one row." };
  if (rows.length > MAX_BULK_ROWS) {
    return { error: `Add at most ${MAX_BULK_ROWS} rows at a time.` };
  }

  const last = await prisma.row.findFirst({
    where: { listId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const start = (last?.position ?? -1) + 1;

  await prisma.row.createMany({
    data: rows.map((data, i) => ({
      listId,
      position: start + i,
      data: JSON.stringify(data),
    })),
  });

  revalidatePath(`/lists/${listId}`);
  return { added: rows.length };
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

export async function deleteRow(listId: string, rowId: string) {
  const list = await getOwnedList(listId);
  if (!list) return;

  await prisma.row.deleteMany({ where: { id: rowId, listId } });

  revalidatePath(`/lists/${listId}`);
}
