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

export const MAX_BULK_ROWS = 500;

export type ParsedRows = { rows: RowData[]; error?: string };

function isBlank(row: RowData) {
  return Object.values(row).every((v) => !v);
}

/** Reads repeated `col_<id>` inputs: the nth value of each column forms row n. Blank rows are skipped. */
export function parseFieldRows(columns: Column[], form: FormData): ParsedRows {
  const values = columns.map((c) => form.getAll(`col_${c.id}`).map((v) => String(v).trim()));
  const count = Math.max(0, ...values.map((v) => v.length));

  const rows: RowData[] = [];
  for (let i = 0; i < count; i++) {
    rows.push(Object.fromEntries(columns.map((c, j) => [c.id, values[j][i] ?? ""])));
  }
  return { rows: rows.filter((r) => !isBlank(r)) };
}

/** One row per line, cells separated by tabs (spreadsheet paste) or commas, in column order. */
export function parseTextRows(columns: Column[], text: string): ParsedRows {
  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const cells = (line.includes("\t") ? line.split("\t") : line.split(",")).map((c) => c.trim());
      return Object.fromEntries(columns.map((c, i) => [c.id, cells[i] ?? ""]));
    });
  return { rows: rows.filter((r) => !isBlank(r)) };
}

/** A JSON object or array of objects keyed by column name (case-insensitive); unknown keys are ignored. */
export function parseJsonRows(columns: Column[], text: string): ParsedRows {
  if (!text.trim()) return { rows: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { rows: [], error: "That isn't valid JSON." };
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];
  const idByName = new Map(columns.map((c) => [c.name.toLowerCase(), c.id]));
  const rows: RowData[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { rows: [], error: 'Each row must be an object, like {"Name": "…"}.' };
    }
    const row: RowData = Object.fromEntries(columns.map((c) => [c.id, ""]));
    for (const [key, value] of Object.entries(item)) {
      const id = idByName.get(key.trim().toLowerCase());
      if (id && value != null) row[id] = String(value).trim();
    }
    rows.push(row);
  }
  return { rows: rows.filter((r) => !isBlank(r)) };
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
