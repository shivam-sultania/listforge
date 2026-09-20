"use client";

export default function DeleteListButton({
  name,
  label = "Delete",
  subtle = false,
}: {
  name: string;
  label?: string;
  /** Fade in on card hover instead of showing permanently. */
  subtle?: boolean;
}) {
  return (
    <button
      className={
        subtle
          ? "btn-danger opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
          : "btn-secondary text-danger"
      }
      onClick={(e) => {
        if (!confirm(`Delete “${name}” and all of its rows?`)) {
          e.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
