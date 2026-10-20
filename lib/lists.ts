import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";

/** Loads a list only if the logged-in user owns it; null otherwise. */
export async function getOwnedList(listId: string) {
  const userId = await requireUserId();
  return prisma.list.findFirst({ where: { id: listId, userId } });
}
