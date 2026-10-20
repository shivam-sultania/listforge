import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/app/components/LoginForm";

export const metadata: Metadata = { title: "Log in · ListForge" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "DEV" ? "/dev" : "/dashboard");

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-1 text-sm text-muted">
        Accounts are created by a ListForge admin.
      </p>

      <LoginForm />
    </main>
  );
}
