"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error?: string; email?: string };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password.", email };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await verifyPassword(password, user.password) : false;

  // Same message for unknown email and wrong password, so emails can't be probed.
  if (!user || !valid) return { error: "Wrong email or password.", email };

  await createSession(user.id);
  redirect(user.role === "DEV" ? "/dev" : "/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
