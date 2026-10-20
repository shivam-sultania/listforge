import Link from "next/link";
import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { requireDev } from "@/lib/auth";
import { setUserRole } from "@/app/actions/dev";
import CreateUserForm from "@/app/components/CreateUserForm";

export const metadata: Metadata = { title: "Dev portal · ListForge" };

export default async function DevPortalPage() {
  const dev = await requireDev();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { lists: true } },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Dev portal</h1>
      <p className="mt-1 text-sm text-muted">
        {users.length} {users.length === 1 ? "user" : "users"}
      </p>

      <div className="mt-8 space-y-6">
        <CreateUserForm />

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Lists</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="w-px px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/dev/users/${user.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {user.email}
                    </Link>
                    {user.id === dev.id && (
                      <span className="ml-2 text-xs text-muted">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={
                        user.role === "DEV"
                          ? "rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent"
                          : "text-xs text-muted"
                      }
                    >
                      {user.role === "DEV" ? "Dev" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums">{user._count.lists}</td>
                  <td className="px-4 py-2.5 text-muted">
                    {user.createdAt.toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {user.id !== dev.id && (
                      <form action={setUserRole}>
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="role"
                          value={user.role === "DEV" ? "USER" : "DEV"}
                        />
                        <button className="btn-ghost">
                          {user.role === "DEV" ? "Make user" : "Make dev"}
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
