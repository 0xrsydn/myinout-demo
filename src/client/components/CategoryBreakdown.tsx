import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { CategoryBreakdown as CategoryData } from "../../shared/types";
import { formatCurrency, formatCurrencyShort } from "../lib/formatters";

interface CategoryBreakdownProps {
  data: CategoryData[];
  title: string;
  type: "expense" | "income";
}

const EXPENSE_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
];

const INCOME_COLORS = [
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
];

export function CategoryBreakdown({
  data,
  title,
  type,
}: CategoryBreakdownProps) {
  const colors = type === "expense" ? EXPENSE_COLORS : INCOME_COLORS;

  const chartData = data.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="font-medium capitalize text-gray-900">{item.category}</p>
          <p className="text-sm text-gray-600">
            Amount: {formatCurrency(item.amount)}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {item.percentage}%
          </p>
          <p className="text-sm text-gray-600">
            Transactions: {item.transaction_count}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    category,
  }: any) => {
    if (percent < 0.05) return null; // Don't show label for small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>

      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">
        {/* Pie Chart */}
        <div className="h-64 w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                dataKey="amount"
                nameKey="category"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Category List */}
        <div className="mt-4 flex-1 lg:mt-0">
          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div
                key={item.category}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="capitalize text-gray-700">
                    {item.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatCurrencyShort(item.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryBreakdownSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-6 w-40 rounded bg-gray-200"></div>
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="h-64 w-full rounded-full bg-gray-200 lg:w-1/2"></div>
        <div className="mt-4 flex-1 space-y-3 lg:mt-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryBreakdown;
