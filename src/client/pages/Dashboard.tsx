import React, { useState } from "react";
import { useAnalysis } from "../hooks/useAnalysis";
import { SummaryCard, SummaryCardSkeleton } from "../components/SummaryCard";
import { CashflowChart, CashflowChartSkeleton } from "../components/CashflowChart";
import {
  CategoryBreakdown,
  CategoryBreakdownSkeleton,
} from "../components/CategoryBreakdown";
import { InsightsSection } from "../components/InsightsSection";
import { DateRangePicker } from "../components/DateRangePicker";

const DEFAULT_POCKET_ID = "pocket_123";

/**
 * Check if daily granularity is allowed for a given date range.
 * Daily view is only allowed for ranges of 31 days or less.
 */
function checkDailyAllowed(start?: string, end?: string): boolean {
  // No dates selected = All Time = not allowed
  if (!start && !end) return false;

  // If we have both dates, check if range is <= 31 days
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 31;
  }

  // If only one date, not a valid range for daily
  return false;
}

export function Dashboard() {
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [granularity, setGranularity] = useState<"monthly" | "daily">("monthly");

  const { data, loading, error, refetch } = useAnalysis({
    pocketId: DEFAULT_POCKET_ID,
    startDate,
    endDate,
  });

  const handleDateChange = (start?: string, end?: string) => {
    setStartDate(start);
    setEndDate(end);

    // Auto-switch to monthly if daily is no longer allowed for this date range
    if (!checkDailyAllowed(start, end) && granularity === "daily") {
      setGranularity("monthly");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Personal Financial Overview
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
                datasetStartDate={data?.period?.start_date}
                datasetEndDate={data?.period?.end_date}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}

        {/* Period Info */}
        {data && (
          <div className="mb-6 text-sm text-gray-600">
            Showing data from{" "}
            <span className="font-medium">{data.period.start_date}</span> to{" "}
            <span className="font-medium">{data.period.end_date}</span>
            {" • "}
            <span className="font-medium">
              {data.summary.transaction_count.toLocaleString()}
            </span>{" "}
            transactions
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
              <SummaryCardSkeleton />
            </>
          ) : data ? (
            <>
              <SummaryCard
                title="Total Income"
                value={data.summary.total_income}
                variant="income"
              />
              <SummaryCard
                title="Total Expense"
                value={data.summary.total_expense}
                variant="expense"
              />
              <SummaryCard
                title="Net Cashflow"
                value={data.summary.net_cashflow}
                variant={data.summary.net_cashflow >= 0 ? "income" : "expense"}
              />
              <SummaryCard
                title="Transactions"
                value={data.summary.transaction_count}
                variant="neutral"
                isCurrency={false}
              />
            </>
          ) : null}
        </div>

        {/* Cashflow Chart */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {granularity === "monthly" ? "Monthly" : "Daily"} Cashflow
            </h2>
            <div className="flex items-center gap-2">
              {(() => {
                const dailyAllowed = checkDailyAllowed(startDate, endDate);
                return (
                  <div className="flex rounded-lg border border-gray-200 p-1">
                    <button
                      onClick={() => setGranularity("monthly")}
                      className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                        granularity === "monthly"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => dailyAllowed && setGranularity("daily")}
                      disabled={!dailyAllowed}
                      title={
                        !dailyAllowed
                          ? "Daily view is only available for date ranges of 1 month or less"
                          : undefined
                      }
                      className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                        !dailyAllowed
                          ? "cursor-not-allowed text-gray-400"
                          : granularity === "daily"
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Daily
                    </button>
                  </div>
                );
              })()}
              <div className="flex rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setChartType("line")}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    chartType === "line"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                    chartType === "bar"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Bar
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <CashflowChartSkeleton />
          ) : data ? (
            <CashflowChart
              data={granularity === "monthly" ? data.monthly_cashflow : data.daily_cashflow}
              type={chartType}
              granularity={granularity}
            />
          ) : null}
        </div>

        {/* Category Breakdown */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <CategoryBreakdownSkeleton />
              <CategoryBreakdownSkeleton />
            </>
          ) : data ? (
            <>
              <CategoryBreakdown
                data={data.expense_by_category}
                title="Expense by Category"
                type="expense"
              />
              <CategoryBreakdown
                data={data.income_by_category}
                title="Income by Category"
                type="income"
              />
            </>
          ) : null}
        </div>

        {/* Trends Summary */}
        {data && data.trends && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Trend Analysis
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Spending Trend</p>
                <p
                  className={`text-lg font-semibold capitalize ${
                    data.trends.spending_trend === "increasing"
                      ? "text-red-600"
                      : data.trends.spending_trend === "decreasing"
                        ? "text-green-600"
                        : "text-gray-600"
                  }`}
                >
                  {data.trends.spending_trend}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Monthly Growth Rate</p>
                <p
                  className={`text-lg font-semibold ${
                    data.trends.monthly_growth_rate > 0
                      ? "text-red-600"
                      : data.trends.monthly_growth_rate < 0
                        ? "text-green-600"
                        : "text-gray-600"
                  }`}
                >
                  {data.trends.monthly_growth_rate > 0 ? "+" : ""}
                  {data.trends.monthly_growth_rate}%
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Peak Spending Month</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.trends.peak_spending_month}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">Lowest Spending Month</p>
                <p className="text-lg font-semibold text-gray-900">
                  {data.trends.lowest_spending_month}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        <InsightsSection
          insights={data?.insights ?? []}
          pocketId={DEFAULT_POCKET_ID}
          startDate={startDate}
          endDate={endDate}
          isPageLoading={loading}
        />
      </main>
    </div>
  );
}

export default Dashboard;
