import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { MonthlyCashflow, DailyCashflow } from "../../shared/types";
import { formatCurrencyShort, formatMonth, formatDayShort } from "../lib/formatters";

interface CashflowChartProps {
  data: MonthlyCashflow[] | DailyCashflow[];
  type?: "line" | "bar";
  granularity?: "monthly" | "daily";
}

export function CashflowChart({ data, type = "line", granularity = "monthly" }: CashflowChartProps) {
  const chartData = data.map((item) => {
    if (granularity === "daily") {
      const dailyItem = item as DailyCashflow;
      return {
        ...dailyItem,
        label: formatDayShort(dailyItem.date),
      };
    }
    const monthlyItem = item as MonthlyCashflow;
    return {
      ...monthlyItem,
      label: formatMonth(monthlyItem.month),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrencyShort(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === "bar") {
    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrencyShort(value)}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="income"
              name="Income"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => formatCurrencyShort(value)}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Expense"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: "#ef4444", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="net"
            name="Net"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: "#3b82f6", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CashflowChartSkeleton() {
  return (
    <div className="h-80 w-full animate-pulse rounded-lg bg-gray-100"></div>
  );
}

export default CashflowChart;
