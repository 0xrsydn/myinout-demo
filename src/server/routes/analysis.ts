import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import {
  performAnalysis,
  calculateSummary,
  calculateMonthlyCashflow,
  calculateDailyCashflow,
  calculateCategoryBreakdown,
  analyzeTrends,
} from "../services/analysis";
import { generateInsights } from "../services/insights";
import { enhanceInsights, isLLMAvailable } from "../services/llm";
import { getFilteredTransactions, getDatasetStats, getDatasetDateRange } from "../services/data-loader";
import type { ApiResponse, AnalysisResult } from "../../shared/types";

const app = new Hono();

// Query parameter validation schema
const analysisQuerySchema = z.object({
  pocket_id: z.string().min(1, "pocket_id is required"),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD")
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD")
    .optional(),
  include_llm: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

/**
 * GET /api/v1/analysis
 * Get financial analysis for a pocket within a date range
 */
app.get(
  "/",
  zValidator("query", analysisQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          error: result.error.issues.map((i) => i.message).join(", "),
        },
        400
      );
    }
  }),
  async (c) => {
    const { pocket_id, start_date, end_date, include_llm } = c.req.valid("query");

    try {
      // Get date range from dataset if not provided
      const datasetRange = getDatasetDateRange();
      const effectiveStartDate = start_date || datasetRange.start_date;
      const effectiveEndDate = end_date || datasetRange.end_date;

      // Get filtered transactions to check if any exist
      const transactions = getFilteredTransactions(
        pocket_id,
        effectiveStartDate,
        effectiveEndDate
      );

      if (transactions.length === 0) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            error: `No transactions found for pocket_id: ${pocket_id} in the specified date range`,
          },
          404
        );
      }

      // Perform analysis
      const analysisResult = performAnalysis(pocket_id, start_date, end_date);

      // Generate insights
      let insights = generateInsights(
        pocket_id,
        effectiveStartDate,
        effectiveEndDate,
        analysisResult.summary,
        analysisResult.expense_by_category,
        analysisResult.income_by_category,
        analysisResult.trends,
        analysisResult.monthly_cashflow
      );

      // Enhance with LLM if requested and available
      let llmEnhanced = false;
      if (include_llm && isLLMAvailable()) {
        insights = await enhanceInsights(insights, {
          summary: analysisResult.summary,
          expenseByCategory: analysisResult.expense_by_category,
          incomeByCategory: analysisResult.income_by_category,
        });
        llmEnhanced = true;
      }

      // Combine analysis with insights
      const result: AnalysisResult = {
        ...analysisResult,
        insights,
      };

      return c.json<ApiResponse<AnalysisResult>>({
        success: true,
        data: result,
        meta: {
          generated_at: new Date().toISOString(),
          llm_enhanced: llmEnhanced,
        },
      });
    } catch (error) {
      console.error("Analysis error:", error);
      return c.json<ApiResponse<null>>(
        {
          success: false,
          error: error instanceof Error ? error.message : "Internal server error",
        },
        500
      );
    }
  }
);

/**
 * GET /api/v1/analysis/categories
 * Get category breakdown for a pocket
 */
app.get("/categories", async (c) => {
  const pocket_id = c.req.query("pocket_id");
  const start_date = c.req.query("start_date");
  const end_date = c.req.query("end_date");
  const type = c.req.query("type") as "INCOME" | "EXPENSE" | undefined;

  if (!pocket_id) {
    return c.json<ApiResponse<null>>(
      { success: false, error: "pocket_id is required" },
      400
    );
  }

  try {
    // Get date range from dataset if not provided
    const datasetRange = getDatasetDateRange();
    const effectiveStartDate = start_date || datasetRange.start_date;
    const effectiveEndDate = end_date || datasetRange.end_date;

    if (type && type !== "INCOME" && type !== "EXPENSE") {
      return c.json<ApiResponse<null>>(
        { success: false, error: "type must be INCOME or EXPENSE" },
        400
      );
    }

    const expenseCategories = calculateCategoryBreakdown(
      pocket_id,
      effectiveStartDate,
      effectiveEndDate,
      "EXPENSE"
    );
    const incomeCategories = calculateCategoryBreakdown(
      pocket_id,
      effectiveStartDate,
      effectiveEndDate,
      "INCOME"
    );

    const result = type
      ? type === "EXPENSE"
        ? { expense_by_category: expenseCategories }
        : { income_by_category: incomeCategories }
      : {
          expense_by_category: expenseCategories,
          income_by_category: incomeCategories,
        };

    return c.json({
      success: true,
      data: result,
      meta: {
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Categories error:", error);
    return c.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
});

/**
 * GET /api/v1/analysis/monthly
 * Get monthly cashflow data
 */
app.get("/monthly", async (c) => {
  const pocket_id = c.req.query("pocket_id");
  const start_date = c.req.query("start_date");
  const end_date = c.req.query("end_date");

  if (!pocket_id) {
    return c.json<ApiResponse<null>>(
      { success: false, error: "pocket_id is required" },
      400
    );
  }

  try {
    // Get date range from dataset if not provided
    const datasetRange = getDatasetDateRange();
    const effectiveStartDate = start_date || datasetRange.start_date;
    const effectiveEndDate = end_date || datasetRange.end_date;

    const monthlyCashflow = calculateMonthlyCashflow(
      pocket_id,
      effectiveStartDate,
      effectiveEndDate
    );

    return c.json({
      success: true,
      data: {
        monthly_cashflow: monthlyCashflow,
      },
      meta: {
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Monthly cashflow error:", error);
    return c.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
});

export default app;
