import { randomUUID } from "crypto";

import { PrismaClient } from "../app/generated/prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

type SeedColumn = {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select";
  options?: string[];
};

function column(
  name: string,
  type: SeedColumn["type"],
  options?: string[],
): SeedColumn {
  return { id: randomUUID(), name, type, ...(options ? { options } : {}) };
}

async function seedList(
  userId: string,
  name: string,
  description: string,
  columns: SeedColumn[],
  rows: Record<string, string>[],
) {
  const existing = await prisma.list.findFirst({ where: { userId, name } });
  if (existing) return;

  await prisma.list.create({
    data: {
      name,
      description,
      userId,
      columns: JSON.stringify(columns),
      rows: {
        create: rows.map((values, position) => ({
          position,
          data: JSON.stringify(
            Object.fromEntries(
              columns.map((col, i) => [col.id, Object.values(values)[i] ?? ""]),
            ),
          ),
        })),
      },
    },
  });
}

async function seedDev() {
  const email = (process.env.SEED_DEV_EMAIL ?? "dev@listforge.dev").toLowerCase();
  const password = process.env.SEED_DEV_PASSWORD;
  if (!password) {
    throw new Error("Set SEED_DEV_PASSWORD in .env to create the dev account.");
  }

  await prisma.user.upsert({
    where: { email },
    update: { role: "DEV" },
    create: { email, password: await hashPassword(password), role: "DEV" },
  });
  console.log(`Seeded dev ${email}`);
}

async function main() {
  await seedDev();

  const demoPassword = await hashPassword("demo1234");
  const user = await prisma.user.upsert({
    where: { email: "demo@listforge.dev" },
    update: { password: demoPassword },
    create: { email: "demo@listforge.dev", password: demoPassword },
  });

  await seedList(
    user.id,
    "Books",
    "Reading list for this year",
    [column("Title", "text"), column("Author", "text"), column("Rating", "number")],
    [
      { a: "Dune", b: "Frank Herbert", c: "5" },
      { a: "Project Hail Mary", b: "Andy Weir", c: "4" },
      { a: "The Left Hand of Darkness", b: "Ursula K. Le Guin", c: "5" },
    ],
  );

  await seedList(
    user.id,
    "Job Applications",
    "Roles applied to and where they stand",
    [
      column("Company", "text"),
      column("Status", "select", ["Applied", "Interview", "Offer", "Rejected"]),
      column("Applied on", "date"),
    ],
    [
      { a: "Vercel", b: "Interview", c: "2026-09-01" },
      { a: "Linear", b: "Applied", c: "2026-09-12" },
    ],
  );

  console.log(`Seeded ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
