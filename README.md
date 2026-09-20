# ListForge

Build lists with columns you define yourself — text, numbers, dates or dropdowns —
and ListForge renders the table around them.

## Stack

- Next.js 16 (App Router, Server Components, Server Actions)
- TypeScript
- Prisma 6 + PostgreSQL
- Tailwind CSS v4

## Getting started

```bash
pnpm install
```

Set `DATABASE_URL` in `.env` to a PostgreSQL connection string, then:

```bash
pnpm prisma migrate dev    # creates tables and seeds demo data
pnpm dev
```

Open http://localhost:3000.

## Data model

`User` → `List` → `Row`.

A list's column definitions live in `List.columns` as a JSON string, and each
row's cell values live in `Row.data` as a JSON string keyed by **column id**
(not name, so columns can be renamed without orphaning data).
See `lib/columns.ts` for the shared types and parsers.

## Auth

Not implemented yet. `lib/auth.ts` returns the seeded demo user; swapping that
one function for a real session lookup is the only change the rest of the app
needs.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm prisma studio` | Browse the database |
| `pnpm prisma db seed` | Re-run the seed |
