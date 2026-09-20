export const COLUMN_TYPES = ["text", "number", "date", "select"] as const;

export type ColumnType = (typeof COLUMN_TYPES)[number];

export type Column = {
  id: string;
  name: string;
  type: ColumnType;
  options?: string[];
};

/** Cell values are stored as strings and coerced on display. */
export type RowData = Record<string, string>;

export const COLUMN_TYPE_LABELS: Record<ColumnType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  select: "Select",
};

export function isColumnType(value: string): value is ColumnType {
  return (COLUMN_TYPES as readonly string[]).includes(value);
}

export function parseColumns(raw: string): Column[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Column =>
        typeof c?.id === "string" &&
        typeof c?.name === "string" &&
        isColumnType(c?.type),
    );
  } catch {
    return [];
  }
}

export function parseRowData(raw: string): RowData {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [
        k,
        v == null ? "" : String(v),
      ]),
    );
  } catch {
    return {};
  }
}

/** Build the stored row payload, keeping only keys the list still defines. */
export function buildRowData(columns: Column[], form: FormData): RowData {
  const data: RowData = {};
  for (const column of columns) {
    const value = form.get(`col_${column.id}`);
    data[column.id] = typeof value === "string" ? value.trim() : "";
  }
  return data;
}

export function formatCell(column: Column, value: string): string {
  if (!value) return "";

  if (column.type === "date") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (column.type === "number") {
    const num = Number(value);
    return Number.isNaN(num) ? value : num.toLocaleString();
  }

  return value;
}

export function inputTypeFor(type: ColumnType): string {
  if (type === "number") return "number";
  if (type === "date") return "date";
  return "text";
}
