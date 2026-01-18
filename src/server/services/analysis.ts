import type {
  Transaction,
  Summary,
  MonthlyCashflow,
  DailyCashflow,
  CategoryBreakdown,
  TrendAnalysis,
  AnalysisResult,
} from "../../shared/types";
import { getFilteredTransactions, getDatasetDateRange } from "./data-loader";
import db from "./database";

/**
 * Calculate financial summary using SQL aggregation
 */
export function calculateSummary(
  walletId: string,
  startDate: string,
  endDate: string
): Summary {
  const result = db
    .query(
      `
    SELECT
      type,
      SUM(amount) as total,
      COUNT(*) as count
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
    GROUP BY type
  `
    )
    .all(walletId, startDate, endDate) as {
    type: "INCOME" | "EXPENSE";
    total: number;
    count: number;
  }[];

  let totalIncome = 0;
  let totalExpense = 0;
  let transactionCount = 0;

  for (const row of result) {
    if (row.type === "INCOME") {
      totalIncome = row.total;
    } else {
      totalExpense = row.total;
    }
    transactionCount += row.count;
  }

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    net_cashflow: totalIncome - totalExpense,
    transaction_count: transactionCount,
  };
}

/**
 * Calculate monthly cashflow using SQL aggregation
 */
export function calculateMonthlyCashflow(
  walletId: string,
  startDate: string,
  endDate: string
): MonthlyCashflow[] {
  const result = db
    .query(
      `
    SELECT
      substr(transaction_date, 1, 7) as month,
      SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
    GROUP BY month
    ORDER BY month ASC
  `
    )
    .all(walletId, startDate, endDate) as {
    month: string;
    income: number;
    expense: number;
  }[];

  return result.map((row) => ({
    month: row.month,
    income: row.income,
    expense: row.expense,
    net: row.income - row.expense,
  }));
}

/**
 * Calculate daily cashflow using SQL aggregation
 */
export function calculateDailyCashflow(
  walletId: string,
  startDate: string,
  endDate: string
): DailyCashflow[] {
  const result = db
    .query(
      `
    SELECT
      transaction_date as date,
      SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
    GROUP BY date
    ORDER BY date ASC
  `
    )
    .all(walletId, startDate, endDate) as {
    date: string;
    income: number;
    expense: number;
  }[];

  return result.map((row) => ({
    date: row.date,
    income: row.income,
    expense: row.expense,
    net: row.income - row.expense,
  }));
}

/**
 * Calculate category breakdown using SQL aggregation
 */
export function calculateCategoryBreakdown(
  walletId: string,
  startDate: string,
  endDate: string,
  type: "INCOME" | "EXPENSE"
): CategoryBreakdown[] {
  // First get total for percentage calculation
  const totalResult = db
    .query(
      `
    SELECT SUM(amount) as total
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
      AND type = ?
  `
    )
    .get(walletId, startDate, endDate, type) as { total: number | null };

  const total = totalResult?.total ?? 0;

  // Get breakdown by category
  const result = db
    .query(
      `
    SELECT
      category,
      SUM(amount) as amount,
      COUNT(*) as transaction_count
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
      AND type = ?
    GROUP BY category
    ORDER BY amount DESC
  `
    )
    .all(walletId, startDate, endDate, type) as {
    category: string;
    amount: number;
    transaction_count: number;
  }[];

  return result.map((row) => ({
    category: row.category,
    amount: row.amount,
    percentage: total > 0 ? Math.round((row.amount / total) * 100) : 0,
    transaction_count: row.transaction_count,
  }));
}

/**
 * Analyze spending trends over time
 */
export function analyzeTrends(monthlyCashflow: MonthlyCashflow[]): TrendAnalysis {
  if (monthlyCashflow.length === 0) {
    return {
      spending_trend: "stable",
      monthly_growth_rate: 0,
      peak_spending_month: "",
      lowest_spending_month: "",
    };
  }

  // Find peak and lowest spending months
  let peakMonth = monthlyCashflow[0]!;
  let lowestMonth = monthlyCashflow[0]!;

  for (const data of monthlyCashflow) {
    if (data.expense > peakMonth.expense) {
      peakMonth = data;
    }
    if (data.expense < lowestMonth.expense) {
      lowestMonth = data;
    }
  }

  // Calculate monthly growth rate
  const growthRate = calculateMonthlyGrowthRate(monthlyCashflow);

  // Determine trend based on growth rate
  let trend: "increasing" | "decreasing" | "stable";
  if (growthRate > 2) {
    trend = "increasing";
  } else if (growthRate < -2) {
    trend = "decreasing";
  } else {
    trend = "stable";
  }

  return {
    spending_trend: trend,
    monthly_growth_rate: Math.round(growthRate * 10) / 10,
    peak_spending_month: peakMonth.month,
    lowest_spending_month: lowestMonth.month,
  };
}

/**
 * Calculate monthly growth rate using simple linear regression
 */
function calculateMonthlyGrowthRate(monthlyCashflow: MonthlyCashflow[]): number {
  if (monthlyCashflow.length < 2) {
    return 0;
  }

  const n = monthlyCashflow.length;
  const expenses = monthlyCashflow.map((m) => m.expense);

  // Simple percentage change between first half average and second half average
  const midpoint = Math.floor(n / 2);
  const firstHalfAvg =
    expenses.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
  const secondHalfAvg =
    expenses.slice(midpoint).reduce((a, b) => a + b, 0) / (n - midpoint);

  if (firstHalfAvg === 0) return 0;

  return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
}

/**
 * Detect anomalies using SQL and Z-score method
 */
export function detectAnomalies(
  walletId: string,
  startDate: string,
  endDate: string,
  type: "INCOME" | "EXPENSE"
): Transaction[] {
  // Get stats for Z-score calculation
  const stats = db
    .query(
      `
    SELECT
      AVG(amount) as mean,
      COUNT(*) as count
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
      AND type = ?
  `
    )
    .get(walletId, startDate, endDate, type) as {
    mean: number | null;
    count: number;
  };

  if (!stats.mean || stats.count < 3) {
    return [];
  }

  // Calculate standard deviation
  const variance = db
    .query(
      `
    SELECT AVG((amount - ?) * (amount - ?)) as variance
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
      AND type = ?
  `
    )
    .get(stats.mean, stats.mean, walletId, startDate, endDate, type) as {
    variance: number | null;
  };

  if (!variance.variance || variance.variance === 0) {
    return [];
  }

  const stdDev = Math.sqrt(variance.variance);
  const threshold = stats.mean + 2 * stdDev;
  const lowerThreshold = stats.mean - 2 * stdDev;

  // Get anomalous transactions
  return db
    .query(
      `
    SELECT *
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
      AND type = ?
      AND (amount > ? OR amount < ?)
    ORDER BY amount DESC
  `
    )
    .all(walletId, startDate, endDate, type, threshold, lowerThreshold) as Transaction[];
}

/**
 * Get category-level monthly spending using SQL
 */
export function getCategoryMonthlyTrend(
  walletId: string,
  startDate: string,
  endDate: string,
  category: string
): { month: string; amount: number }[] {
  return db
    .query(
      `
    SELECT
      substr(transaction_date, 1, 7) as month,
      SUM(amount) as amount
    FROM transactions
    WHERE wallet_id = ?
      AND transaction_date >= ?
      AND transaction_date <= ?
      AND type = 'EXPENSE'
      AND category = ?
    GROUP BY month
    ORDER BY month ASC
  `
    )
    .all(walletId, startDate, endDate, category) as { month: string; amount: number }[];
}

/**
 * Perform complete financial analysis
 */
export function performAnalysis(
  pocketId: string,
  startDate?: string,
  endDate?: string
): AnalysisResult {
  // Get date range from dataset if not provided
  const datasetRange = getDatasetDateRange();
  const effectiveStartDate = startDate || datasetRange.start_date;
  const effectiveEndDate = endDate || datasetRange.end_date;

  // Calculate all metrics using SQL
  const summary = calculateSummary(pocketId, effectiveStartDate, effectiveEndDate);
  const monthlyCashflow = calculateMonthlyCashflow(
    pocketId,
    effectiveStartDate,
    effectiveEndDate
  );
  const dailyCashflow = calculateDailyCashflow(
    pocketId,
    effectiveStartDate,
    effectiveEndDate
  );
  const expenseByCategory = calculateCategoryBreakdown(
    pocketId,
    effectiveStartDate,
    effectiveEndDate,
    "EXPENSE"
  );
  const incomeByCategory = calculateCategoryBreakdown(
    pocketId,
    effectiveStartDate,
    effectiveEndDate,
    "INCOME"
  );
  const trends = analyzeTrends(monthlyCashflow);

  return {
    period: {
      start_date: effectiveStartDate,
      end_date: effectiveEndDate,
    },
    summary,
    monthly_cashflow: monthlyCashflow,
    daily_cashflow: dailyCashflow,
    expense_by_category: expenseByCategory,
    income_by_category: incomeByCategory,
    trends,
    insights: [], // Will be populated by insights service
  };
}
