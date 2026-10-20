import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;

/** The database stores only a hash, so a leaked DB can't be used to log in. */
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  const oldToken = cookieStore.get(SESSION_COOKIE)?.value;

  // Remove this browser's previous session and any of the user's expired ones.
  await prisma.session.deleteMany({
    where: {
      OR: [
        ...(oldToken ? [{ id: hashToken(oldToken) }] : []),
        { userId, expiresAt: { lt: new Date() } },
      ],
    },
  });

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { id: hashToken(token), userId, expiresAt },
  });

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/** Returns the logged-in user, or null if the cookie is missing, unknown or expired. */
export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashToken(token) },
    include: {
      user: { select: { id: true, email: true, role: true, createdAt: true } },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;

  return session.user;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { id: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
}
