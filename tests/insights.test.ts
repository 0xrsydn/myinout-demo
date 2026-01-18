import { describe, it, expect } from "vitest";
import { generateInsights } from "../src/server/services/insights";
import type {
  Transaction,
  Summary,
  CategoryBreakdown,
  TrendAnalysis,
  MonthlyCashflow,
} from "../src/shared/types";

// Test fixtures
const mockSummary: Summary = {
  total_income: 12000000,
  total_expense: 10000000,
  net_cashflow: 2000000,
  transaction_count: 50,
};

const mockExpenseByCategory: CategoryBreakdown[] = [
  { category: "food", amount: 3600000, percentage: 36, transaction_count: 20 },
  { category: "transport", amount: 2500000, percentage: 25, transaction_count: 15 },
  { category: "utilities", amount: 1500000, percentage: 15, transaction_count: 5 },
  { category: "entertainment", amount: 1400000, percentage: 14, transaction_count: 8 },
  { category: "shopping", amount: 1000000, percentage: 10, transaction_count: 2 },
];

const mockIncomeByCategory: CategoryBreakdown[] = [
  { category: "salary", amount: 10000000, percentage: 83, transaction_count: 1 },
  { category: "freelance", amount: 2000000, percentage: 17, transaction_count: 3 },
];

const mockTrends: TrendAnalysis = {
  spending_trend: "increasing",
  monthly_growth_rate: 15,
  peak_spending_month: "2024-06",
  lowest_spending_month: "2024-01",
};

const mockMonthlyCashflow: MonthlyCashflow[] = [
  { month: "2024-01", income: 6000000, expense: 4000000, net: 2000000 },
  { month: "2024-02", income: 6000000, expense: 6000000, net: 0 },
];

const mockTransactions: Transaction[] = [
  {
    id: 1,
    wallet_id: "pocket_123",
    type: "EXPENSE",
    category: "food",
    amount: 500000,
    currency: "IDR",
    transaction_date: "2024-01-15",
    created_at: "2024-01-15T08:00:00Z",
  },
];

describe("Insights Service", () => {
  describe("generateInsights", () => {
    it("should generate insights array", () => {
      const insights = generateInsights(
        mockTransactions,
        mockSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it("should generate warning for high spending category", () => {
      const insights = generateInsights(
        mockTransactions,
        mockSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      const highSpendingWarning = insights.find(
        (i) => i.type === "warning" && i.title.toLowerCase().includes("food")
      );
      expect(highSpendingWarning).toBeDefined();
    });

    it("should generate trend insight for increasing spending", () => {
      const insights = generateInsights(
        mockTransactions,
        mockSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      const trendInsight = insights.find(
        (i) => i.type === "trend" && i.title.toLowerCase().includes("rising")
      );
      expect(trendInsight).toBeDefined();
    });

    it("should include deep_analysis in all insights", () => {
      const insights = generateInsights(
        mockTransactions,
        mockSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      insights.forEach((insight) => {
        expect(insight.deep_analysis).toBeDefined();
        expect(insight.deep_analysis.length).toBeGreaterThan(0);
      });
    });

    it("should limit insights to max 5", () => {
      const insights = generateInsights(
        mockTransactions,
        mockSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      expect(insights.length).toBeLessThanOrEqual(5);
    });

    it("should generate savings insight when savings rate is low", () => {
      const lowSavingsSummary: Summary = {
        ...mockSummary,
        total_income: 10000000,
        total_expense: 9500000,
        net_cashflow: 500000, // Only 5% savings rate
      };

      const insights = generateInsights(
        mockTransactions,
        lowSavingsSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      const savingsInsight = insights.find(
        (i) => i.type === "recommendation" && i.title.toLowerCase().includes("savings")
      );
      expect(savingsInsight).toBeDefined();
    });

    it("should generate warning for negative cashflow", () => {
      const negativeSummary: Summary = {
        ...mockSummary,
        total_income: 8000000,
        total_expense: 10000000,
        net_cashflow: -2000000,
      };

      const insights = generateInsights(
        mockTransactions,
        negativeSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      const negativeWarning = insights.find(
        (i) => i.type === "warning" && i.title.toLowerCase().includes("negative")
      );
      expect(negativeWarning).toBeDefined();
    });

    it("should generate healthy savings insight when savings rate is good", () => {
      const goodSavingsSummary: Summary = {
        ...mockSummary,
        total_income: 10000000,
        total_expense: 7000000,
        net_cashflow: 3000000, // 30% savings rate
      };

      const insights = generateInsights(
        mockTransactions,
        goodSavingsSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        { ...mockTrends, spending_trend: "stable", monthly_growth_rate: 0 },
        mockMonthlyCashflow
      );

      const healthyInsight = insights.find(
        (i) => i.type === "trend" && i.title.toLowerCase().includes("healthy")
      );
      expect(healthyInsight).toBeDefined();
    });
  });

  describe("insight types", () => {
    it("should have valid insight types", () => {
      const insights = generateInsights(
        mockTransactions,
        mockSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      const validTypes = ["warning", "trend", "recommendation"];
      insights.forEach((insight) => {
        expect(validTypes).toContain(insight.type);
      });
    });

    it("should have non-empty title and message", () => {
      const insights = generateInsights(
        mockTransactions,
        mockSummary,
        mockExpenseByCategory,
        mockIncomeByCategory,
        mockTrends,
        mockMonthlyCashflow
      );

      insights.forEach((insight) => {
        expect(insight.title.length).toBeGreaterThan(0);
        expect(insight.message.length).toBeGreaterThan(0);
      });
    });
  });
});
