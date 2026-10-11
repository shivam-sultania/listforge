import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-7 place-items-center rounded-md bg-accent text-sm text-white">
            L
          </span>
          ListForge
        </Link>

        <div className="flex flex-1 items-center gap-5 text-sm text-muted">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/lists/new" className="hover:text-foreground">
            New list
          </Link>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Link href="/login" className="btn-primary px-3 py-1.5">
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}
