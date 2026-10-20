"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { getOwnedList } from "@/lib/lists";
import { isColumnType, parseColumns, type Column } from "@/lib/columns";

export type ActionState = { error?: string };

function parseOptions(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

async function saveColumns(listId: string, columns: Column[]) {
  await prisma.list.update({
    where: { id: listId },
    data: { columns: JSON.stringify(columns) },
  });

  revalidatePath(`/lists/${listId}`);
  revalidatePath("/dashboard");
}

export async function createList(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Give your list a name." };

  const list = await prisma.list.create({
    data: {
      name,
      description: description || null,
      columns: "[]",
      userId,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/lists/${list.id}`);
}

export async function deleteList(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("listId") ?? "");

  await prisma.list.deleteMany({ where: { id, userId } });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateList(formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("listId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return;

  await prisma.list.updateMany({
    where: { id, userId },
    data: { name, description: description || null },
  });

  revalidatePath(`/lists/${id}`);
  revalidatePath("/dashboard");
}

export async function addColumn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const listId = String(formData.get("listId") ?? "");
  const list = await getOwnedList(listId);
  if (!list) return { error: "List not found." };

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const options = parseOptions(formData.get("options"));

  if (!name) return { error: "Give the column a name." };
  if (!isColumnType(type)) return { error: "Pick a column type." };

  const columns = parseColumns(list.columns);
  if (columns.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return { error: `A column named "${name}" already exists.` };
  }

  columns.push({
    id: randomUUID(),
    name,
    type,
    ...(type === "select" && options.length ? { options } : {}),
  });

  await saveColumns(listId, columns);
  return {};
}

export async function updateColumn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const listId = String(formData.get("listId") ?? "");
  const columnId = String(formData.get("columnId") ?? "");
  const list = await getOwnedList(listId);
  if (!list) return { error: "List not found." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give the column a name." };

  const columns = parseColumns(list.columns);
  const column = columns.find((c) => c.id === columnId);
  if (!column) return { error: "Column not found." };

  const duplicate = columns.some(
    (c) => c.id !== columnId && c.name.toLowerCase() === name.toLowerCase(),
  );
  if (duplicate) return { error: `A column named "${name}" already exists.` };

  column.name = name;
  if (column.type === "select") {
    const options = parseOptions(formData.get("options"));
    column.options = options.length ? options : undefined;
  }

  await saveColumns(listId, columns);
  return {};
}

export async function deleteColumn(formData: FormData) {
  const listId = String(formData.get("listId") ?? "");
  const columnId = String(formData.get("columnId") ?? "");
  const list = await getOwnedList(listId);
  if (!list) return;

  const columns = parseColumns(list.columns).filter((c) => c.id !== columnId);
  await saveColumns(listId, columns);
}
