import React from "react";
import { formatCurrency, formatNumber } from "../lib/formatters";

interface SummaryCardProps {
  title: string;
  value: number;
  trend?: number;
  icon?: React.ReactNode;
  variant?: "default" | "income" | "expense" | "neutral";
  isCurrency?: boolean;
}

export function SummaryCard({
  title,
  value,
  trend,
  icon,
  variant = "default",
  isCurrency = true,
}: SummaryCardProps) {
  const variantStyles = {
    default: "bg-white border-gray-200",
    income: "bg-green-50 border-green-200",
    expense: "bg-red-50 border-red-200",
    neutral: "bg-blue-50 border-blue-200",
  };

  const valueColors = {
    default: "text-gray-900",
    income: "text-green-700",
    expense: "text-red-700",
    neutral: "text-blue-700",
  };

  const trendColors = {
    positive: "text-green-600 bg-green-100",
    negative: "text-red-600 bg-red-100",
    neutral: "text-gray-600 bg-gray-100",
  };

  const getTrendColor = () => {
    if (!trend) return trendColors.neutral;
    if (variant === "expense") {
      // For expenses, lower is better
      return trend > 0 ? trendColors.negative : trendColors.positive;
    }
    // For income and neutral, higher is better
    return trend > 0 ? trendColors.positive : trendColors.negative;
  };

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md ${variantStyles[variant]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="mt-3">
        <span className={`text-2xl font-bold ${valueColors[variant]}`}>
          {isCurrency ? formatCurrency(value) : formatNumber(value)}
        </span>
      </div>
      {trend !== undefined && (
        <div className="mt-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTrendColor()}`}
          >
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="h-4 w-24 rounded bg-gray-200"></div>
      <div className="mt-3 h-8 w-32 rounded bg-gray-200"></div>
      <div className="mt-2 h-5 w-16 rounded bg-gray-200"></div>
    </div>
  );
}

export default SummaryCard;
