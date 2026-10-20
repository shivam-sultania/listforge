"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireDev } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export type CreateUserState = { error?: string; created?: string };

const MIN_PASSWORD = 8;

export async function createUser(
  _prev: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  await requireDev();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "DEV" ? "DEV" : "USER";

  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: `${email} already has an account.` };

  await prisma.user.create({
    data: { email, password: await hashPassword(password), role },
  });

  revalidatePath("/dev");
  return { created: email };
}

export async function setUserRole(formData: FormData) {
  const dev = await requireDev();

  const userId = String(formData.get("userId") ?? "");
  const role = formData.get("role") === "DEV" ? "DEV" : "USER";

  // A dev can't demote themselves, so there is always at least one dev.
  if (userId === dev.id) return;

  await prisma.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/dev");
  revalidatePath(`/dev/users/${userId}`);
}
