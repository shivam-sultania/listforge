"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { isColumnType, type Column } from "@/lib/columns";

export type ActionState = { error?: string };

function parseColumnPayload(raw: FormDataEntryValue | null): Column[] {
  if (typeof raw !== "string") return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry): Column[] => {
    if (!entry || typeof entry !== "object") return [];
    const candidate = entry as Record<string, unknown>;
    const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
    const type = typeof candidate.type === "string" ? candidate.type : "";
    if (!name || !isColumnType(type)) return [];

    const options = Array.isArray(candidate.options)
      ? candidate.options
          .filter((o): o is string => typeof o === "string")
          .map((o) => o.trim())
          .filter(Boolean)
      : undefined;

    return [
      {
        id: typeof candidate.id === "string" && candidate.id ? candidate.id : randomUUID(),
        name,
        type,
        ...(type === "select" && options?.length ? { options } : {}),
      },
    ];
  });
}

export async function createList(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await requireUserId();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const columns = parseColumnPayload(formData.get("columns"));

  if (!name) return { error: "Give your list a name." };
  if (columns.length === 0) return { error: "Add at least one column." };

  const duplicate = columns.find(
    (col, i) =>
      columns.findIndex(
        (other) => other.name.toLowerCase() === col.name.toLowerCase(),
      ) !== i,
  );
  if (duplicate) return { error: `Duplicate column name: "${duplicate.name}".` };

  const list = await prisma.list.create({
    data: {
      name,
      description: description || null,
      columns: JSON.stringify(columns),
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
