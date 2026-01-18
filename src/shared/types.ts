import { z } from "zod";

// Transaction schemas
export const TransactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const ExpenseCategorySchema = z.enum([
  "utilities",
  "entertainment",
  "education",
  "transport",
  "food",
  "shopping",
  "health",
  "other",
]);
export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;

export const IncomeCategorySchema = z.enum([
  "salary",
  "freelance",
  "investment",
  "bonus",
  "other",
]);
export type IncomeCategory = z.infer<typeof IncomeCategorySchema>;

export const TransactionSchema = z.object({
  id: z.number(),
  wallet_id: z.string(),
  type: TransactionTypeSchema,
  category: z.string(),
  amount: z.number().positive(),
  currency: z.string(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  created_at: z.string(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const DatasetMetaSchema = z.object({
  description: z.string(),
  wallet_id: z.string(),
  currency: z.string(),
  total_transactions: z.number(),
  period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
});
export type DatasetMeta = z.infer<typeof DatasetMetaSchema>;

export const DatasetSchema = z.object({
  meta: DatasetMetaSchema,
  transactions: z.array(TransactionSchema),
});
export type Dataset = z.infer<typeof DatasetSchema>;

// Analysis result types
export interface Period {
  start_date: string;
  end_date: string;
}

export interface Summary {
  total_income: number;
  total_expense: number;
  net_cashflow: number;
  transaction_count: number;
}

export interface MonthlyCashflow {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface DailyCashflow {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface TrendAnalysis {
  spending_trend: "increasing" | "decreasing" | "stable";
  monthly_growth_rate: number;
  peak_spending_month: string;
  lowest_spending_month: string;
}

export type InsightType = "warning" | "trend" | "recommendation";

export interface Insight {
  type: InsightType;
  title: string;
  message: string;
  deep_analysis: string;
}

export interface AnalysisResult {
  period: Period;
  summary: Summary;
  monthly_cashflow: MonthlyCashflow[];
  daily_cashflow: DailyCashflow[];
  expense_by_category: CategoryBreakdown[];
  income_by_category: CategoryBreakdown[];
  trends: TrendAnalysis;
  insights: Insight[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    generated_at: string;
    llm_enhanced: boolean;
  };
}

// Query parameters
export interface AnalysisQueryParams {
  pocket_id: string;
  start_date?: string;
  end_date?: string;
  include_llm?: boolean;
}
