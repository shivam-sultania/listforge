import Link from "next/link";

import { deleteList } from "@/app/actions/lists";
import { parseColumns } from "@/lib/columns";
import DeleteListButton from "@/app/components/DeleteListButton";

type Props = {
  list: {
    id: string;
    name: string;
    description: string | null;
    columns: string;
    updatedAt: Date;
    _count: { rows: number };
  };
};

export default function ListCard({ list }: Props) {
  const columns = parseColumns(list.columns);

  return (
    <div className="card group relative flex h-full flex-col p-5 transition-colors hover:border-accent">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-medium">
          {/* Stretched link keeps the whole card clickable without nesting
              the delete button inside an anchor */}
          <Link href={`/lists/${list.id}`} className="before:absolute before:inset-0">
            {list.name}
          </Link>
        </h2>

        <form action={deleteList} className="relative z-10">
          <input type="hidden" name="listId" value={list.id} />
          <DeleteListButton name={list.name} subtle />
        </form>
      </div>

      {list.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {list.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {columns.slice(0, 4).map((column) => (
          <span
            key={column.id}
            className="rounded-md bg-accent-soft px-2 py-0.5 text-xs text-accent"
          >
            {column.name}
          </span>
        ))}
        {columns.length > 4 && (
          <span className="px-1 py-0.5 text-xs text-muted">
            +{columns.length - 4}
          </span>
        )}
      </div>

      <p className="mt-auto pt-4 text-xs text-muted">
        {list._count.rows} {list._count.rows === 1 ? "row" : "rows"} · updated{" "}
        {list.updatedAt.toLocaleDateString()}
      </p>
    </div>
  );
}
