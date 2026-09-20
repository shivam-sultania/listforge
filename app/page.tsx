import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ListForge — lists with columns you define",
  description:
    "Create custom lists with your own columns: text, numbers, dates and dropdowns.",
};

const FEATURES = [
  {
    title: "Columns you define",
    body: "Every list starts empty. Add the fields you actually need — Title, Rating, Status, Applied On — and the table is built around them.",
  },
  {
    title: "Four column types",
    body: "Text, number, date and dropdown. Each one renders the right input when adding a row and formats sensibly when displayed.",
  },
  {
    title: "Edit in place",
    body: "Rows are editable inline. No modals to hunt through, no separate edit screens to navigate to.",
  },
];

const STEPS = [
  { n: "1", title: "Create a list", body: "Name it and sketch out its columns." },
  { n: "2", title: "Add rows", body: "A form built from your column definitions." },
  { n: "3", title: "Keep it current", body: "Edit or remove entries as things change." },
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-3xl px-6 pt-24 pb-16 text-center">
        <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          Lists, your shape
        </span>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
          Build a list for anything
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Books, job applications, expenses, gear — whatever you are tracking
          needs different fields. ListForge lets you define them yourself
          instead of bending your data into someone else&apos;s template.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/lists/new" className="btn-primary">
            Create a list
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            View dashboard
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card p-6">
              <h2 className="font-medium">{feature.title}</h2>
              <p className="mt-2 text-sm text-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            How it works
          </h2>

          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.n}>
                <span className="grid size-8 place-items-center rounded-full bg-accent text-sm font-medium text-white">
                  {step.n}
                </span>
                <h3 className="mt-3 font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Start with your first list
        </h2>
        <p className="mt-2 text-muted">
          It takes about a minute to set up.
        </p>
        <Link href="/lists/new" className="btn-primary mt-6">
          Create a list
        </Link>
      </section>
    </main>
  );
}
