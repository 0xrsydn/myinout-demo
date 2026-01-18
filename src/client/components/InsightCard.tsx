import React, { useState } from "react";
import type { Insight, InsightType } from "../../shared/types";

interface InsightCardProps {
  insight: Insight;
}

const insightStyles: Record<
  InsightType,
  { bg: string; border: string; icon: string; iconBg: string }
> = {
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  trend: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  recommendation: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-600",
    iconBg: "bg-green-100",
  },
};

const insightIcons: Record<InsightType, React.ReactElement> = {
  warning: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  trend: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
        clipRule="evenodd"
      />
    </svg>
  ),
  recommendation: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

export function InsightCard({ insight }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = insightStyles[insight.type];

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${style.bg} ${style.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2 ${style.iconBg} ${style.icon}`}>
          {insightIcons[insight.type]}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <span
                className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style.iconBg} ${style.icon}`}
              >
                {insight.type}
              </span>
              <h4 className="font-semibold text-gray-900">{insight.title}</h4>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-700">{insight.message}</p>
          {expanded && insight.deep_analysis && (
            <div className="mt-3 rounded-lg bg-white/50 p-3">
              <p className="text-sm text-gray-600">{insight.deep_analysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-4 w-20 rounded bg-gray-200"></div>
          <div className="mt-2 h-5 w-40 rounded bg-gray-200"></div>
          <div className="mt-2 h-4 w-full rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export default InsightCard;
