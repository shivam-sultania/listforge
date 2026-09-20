import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@listforge.dev";

/**
 * Temporary stand-in for real auth: always resolves the seeded demo user.
 * Swap this single function for a session lookup when auth lands.
 */
export async function getCurrentUser() {
  const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (!user) {
    throw new Error(
      `No user found for ${DEMO_EMAIL}. Run "pnpm prisma db seed" first.`,
    );
  }

  return user;
}

export async function requireUserId() {
  const user = await getCurrentUser();
  return user.id;
}
