/**
 * Markdown pre-processor for structuring LLM responses
 */

export type SectionType = "header" | "paragraph" | "table" | "list" | "unknown";

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface ParsedSection {
  type: SectionType;
  content: string;
  level?: number;
  tableData?: TableData;
}

export interface ParsedMarkdown {
  sections: ParsedSection[];
  raw: string;
}

/**
 * Parse a markdown table block into structured data
 */
function parseTable(tableBlock: string): TableData {
  const lines = tableBlock.split("\n").filter((line) => line.trim());
  const headers: string[] = [];
  const rows: string[][] = [];

  for (const line of lines) {
    // Skip separator row (contains ---)
    if (line.includes("---")) continue;

    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);

    if (headers.length === 0) {
      headers.push(...cells);
    } else {
      rows.push(cells);
    }
  }

  return { headers, rows };
}

/**
 * Check if a block is a markdown table
 */
function isTableBlock(block: string): boolean {
  const lines = block.split("\n").filter((line) => line.trim());
  // A table needs at least 2 lines (header + separator) and must contain | and ---
  return (
    lines.length >= 2 &&
    block.includes("|") &&
    lines.some((line) => line.includes("---"))
  );
}

/**
 * Parse markdown content into structured sections
 */
export function parseMarkdown(markdown: string): ParsedMarkdown {
  const sections: ParsedSection[] = [];
  // Split by double newlines to identify block-level elements
  const blocks = markdown.split(/\n\n+/);

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Detect headers (# ## ### etc)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/m);
    if (headerMatch?.[1] && !trimmed.includes("\n")) {
      sections.push({
        type: "header",
        content: trimmed,
        level: headerMatch[1].length,
      });
      continue;
    }

    // Detect tables (has | and separator row with ---)
    if (isTableBlock(trimmed)) {
      const tableData = parseTable(trimmed);
      sections.push({
        type: "table",
        content: trimmed,
        tableData,
      });
      continue;
    }

    // Detect lists (starts with -, *, or numbered)
    const listPattern = /^[-*]\s+|^\d+\.\s+/m;
    if (listPattern.test(trimmed)) {
      sections.push({
        type: "list",
        content: trimmed,
      });
      continue;
    }

    // Default: paragraph
    sections.push({
      type: "paragraph",
      content: trimmed,
    });
  }

  return { sections, raw: markdown };
}
