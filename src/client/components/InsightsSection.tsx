import React, { useState } from "react";
import type { Insight } from "../../shared/types";
import { InsightCard, InsightCardSkeleton } from "./InsightCard";
import { fetchLlmInsights } from "../lib/api";

interface InsightsSectionProps {
  insights: Insight[];
  pocketId: string;
  startDate?: string;
  endDate?: string;
  isPageLoading: boolean;
}

export function InsightsSection({
  insights,
  pocketId,
  startDate,
  endDate,
  isPageLoading,
}: InsightsSectionProps) {
  const [llmInsights, setLlmInsights] = useState<Insight[] | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState<string | null>(null);

  const isLlmEnhanced = llmInsights !== null;
  const displayInsights = llmInsights ?? insights;

  const handleFetchLlmInsights = async () => {
    setLlmLoading(true);
    setLlmError(null);

    try {
      const enhanced = await fetchLlmInsights({
        pocketId,
        startDate,
        endDate,
      });
      setLlmInsights(enhanced);
    } catch (err) {
      setLlmError(err instanceof Error ? err.message : "Failed to fetch AI insights");
    } finally {
      setLlmLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
        <div className="flex items-center gap-2">
          {isLlmEnhanced && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              AI Enhanced
            </span>
          )}
          {!isLlmEnhanced && !isPageLoading && (
            <button
              onClick={handleFetchLlmInsights}
              disabled={llmLoading}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                llmLoading
                  ? "border-purple-300 bg-purple-50 text-purple-400"
                  : "border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100"
              }`}
            >
              {llmLoading ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {llmLoading ? "Loading..." : "AI Insights"}
            </button>
          )}
        </div>
      </div>

      {llmError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {llmError}
        </div>
      )}

      <div className="space-y-4">
        {isPageLoading || llmLoading ? (
          <>
            <InsightCardSkeleton />
            <InsightCardSkeleton />
            <InsightCardSkeleton />
          </>
        ) : displayInsights.length > 0 ? (
          displayInsights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))
        ) : (
          <p className="text-center text-gray-500">
            No insights available for this period.
          </p>
        )}
      </div>
    </div>
  );
}

export default InsightsSection;
