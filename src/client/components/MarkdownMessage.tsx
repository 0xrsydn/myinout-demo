import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { ParsedSection } from "../lib/markdown-parser";
import { parseMarkdown } from "../lib/markdown-parser";
import { MarkdownTable } from "./MarkdownTable";

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

// Custom component overrides for Tailwind styling
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-gray-900 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-gray-900 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-gray-900 mb-1">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-semibold text-gray-800 mb-1">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-sm text-gray-700 leading-relaxed">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 ml-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
  // Fallback table styling (if not caught by pre-processor)
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-200">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="hover:bg-gray-50">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-3 py-2 text-gray-700">{children}</td>,
};

interface MarkdownSectionProps {
  section: ParsedSection;
}

function MarkdownSection({ section }: MarkdownSectionProps) {
  // For tables, use custom component with extracted data
  if (section.type === "table" && section.tableData) {
    return <MarkdownTable data={section.tableData} />;
  }

  // For all other sections, use react-markdown with custom components
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {section.content}
    </ReactMarkdown>
  );
}

export function MarkdownMessage({
  content,
  className = "",
}: MarkdownMessageProps) {
  const parsed = parseMarkdown(content);

  return (
    <div className={`markdown-message space-y-3 ${className}`}>
      {parsed.sections.map((section, index) => (
        <MarkdownSection key={index} section={section} />
      ))}
    </div>
  );
}
