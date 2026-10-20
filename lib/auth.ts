import { cache } from "react";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/session";

/** The logged-in user or null; cached so one request hits the DB once. */
export const getCurrentUser = cache(getSessionUser);

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireUserId() {
  const user = await requireUser();
  return user.id;
}

export async function requireDev() {
  const user = await requireUser();
  if (user.role !== "DEV") redirect("/dashboard");
  return user;
}
