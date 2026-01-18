import type { TableData } from "../lib/markdown-parser";

interface MarkdownTableProps {
  data: TableData;
}

export function MarkdownTable({ data }: MarkdownTableProps) {
  const { headers, rows } = data;

  if (headers.length === 0) return null;

  return (
    <div className="overflow-x-auto my-2">
      <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
