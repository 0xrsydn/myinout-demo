import { generateText, tool, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import {
  calculateSummary,
  calculateMonthlyCashflow,
  calculateCategoryBreakdown,
  analyzeTrends,
} from "./analysis";
import { getFilteredTransactions, getDatasetDateRange } from "./data-loader";
import { formatCurrency } from "./formatters";

const CHAT_SYSTEM_PROMPT = `Anda adalah asisten keuangan pribadi yang membantu pengguna memahami dan menganalisis data transaksi keuangan mereka.

Anda memiliki akses ke berbagai tools untuk mengambil data dari database transaksi pengguna. Gunakan tools ini untuk menjawab pertanyaan pengguna dengan data yang akurat.

Panduan:
- Selalu gunakan tools yang tersedia untuk mendapatkan data sebelum menjawab
- Tulis dalam Bahasa Indonesia yang profesional namun ramah
- Format mata uang sebagai Rupiah (Rp X.XXX.XXX)
- Berikan insight yang actionable berdasarkan data
- Jika pengguna tidak menentukan tanggal, gunakan seluruh rentang data yang tersedia
- Jelaskan angka-angka dengan konteks yang relevan

Kemampuan Anda:
- Melihat ringkasan keuangan (total income, expense, net cashflow)
- Menganalisis pengeluaran dan pemasukan per kategori
- Melihat tren bulanan dan pola pengeluaran
- Mencari transaksi spesifik
- Memberikan saran pengelolaan keuangan`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Check if chat service is available
 */
export function isChatAvailable(): boolean {
  return !!process.env.OPENROUTER_API_KEY && !!process.env.OPENROUTER_MODEL;
}

/**
 * Create tools for LLM to query transaction data
 */
function createTools(pocketId: string) {
  const dateRange = getDatasetDateRange();

  return {
    getSummary: tool({
      description:
        "Get financial summary including total income, total expense, net cashflow, and transaction count for a date range",
      inputSchema: z.object({
        start_date: z
          .string()
          .optional()
          .describe("Start date in YYYY-MM-DD format"),
        end_date: z
          .string()
          .optional()
          .describe("End date in YYYY-MM-DD format"),
      }),
      execute: async ({ start_date, end_date }) => {
        const startDate = start_date || dateRange.start_date;
        const endDate = end_date || dateRange.end_date;
        const summary = calculateSummary(pocketId, startDate, endDate);
        return {
          period: { start_date: startDate, end_date: endDate },
          total_income: summary.total_income,
          total_income_formatted: formatCurrency(summary.total_income),
          total_expense: summary.total_expense,
          total_expense_formatted: formatCurrency(summary.total_expense),
          net_cashflow: summary.net_cashflow,
          net_cashflow_formatted: formatCurrency(summary.net_cashflow),
          transaction_count: summary.transaction_count,
        };
      },
    }),

    getCategoryBreakdown: tool({
      description:
        "Get breakdown of spending or income by category, sorted by amount descending",
      inputSchema: z.object({
        type: z
          .enum(["INCOME", "EXPENSE"])
          .describe("Type of transactions to analyze"),
        start_date: z
          .string()
          .optional()
          .describe("Start date in YYYY-MM-DD format"),
        end_date: z
          .string()
          .optional()
          .describe("End date in YYYY-MM-DD format"),
      }),
      execute: async ({ type, start_date, end_date }) => {
        const startDate = start_date || dateRange.start_date;
        const endDate = end_date || dateRange.end_date;
        const breakdown = calculateCategoryBreakdown(
          pocketId,
          startDate,
          endDate,
          type
        );
        return {
          period: { start_date: startDate, end_date: endDate },
          type,
          categories: breakdown.map((cat) => ({
            category: cat.category,
            amount: cat.amount,
            amount_formatted: formatCurrency(cat.amount),
            percentage: cat.percentage,
            transaction_count: cat.transaction_count,
          })),
        };
      },
    }),

    getMonthlyCashflow: tool({
      description:
        "Get monthly cashflow data showing income, expense, and net for each month",
      inputSchema: z.object({
        start_date: z
          .string()
          .optional()
          .describe("Start date in YYYY-MM-DD format"),
        end_date: z
          .string()
          .optional()
          .describe("End date in YYYY-MM-DD format"),
      }),
      execute: async ({ start_date, end_date }) => {
        const startDate = start_date || dateRange.start_date;
        const endDate = end_date || dateRange.end_date;
        const monthly = calculateMonthlyCashflow(pocketId, startDate, endDate);
        return {
          period: { start_date: startDate, end_date: endDate },
          monthly_data: monthly.map((m) => ({
            month: m.month,
            income: m.income,
            income_formatted: formatCurrency(m.income),
            expense: m.expense,
            expense_formatted: formatCurrency(m.expense),
            net: m.net,
            net_formatted: formatCurrency(m.net),
          })),
        };
      },
    }),

    getTrends: tool({
      description:
        "Get spending trend analysis including whether spending is increasing/decreasing/stable, growth rate, and peak/lowest spending months",
      inputSchema: z.object({
        start_date: z
          .string()
          .optional()
          .describe("Start date in YYYY-MM-DD format"),
        end_date: z
          .string()
          .optional()
          .describe("End date in YYYY-MM-DD format"),
      }),
      execute: async ({ start_date, end_date }) => {
        const startDate = start_date || dateRange.start_date;
        const endDate = end_date || dateRange.end_date;
        const monthly = calculateMonthlyCashflow(pocketId, startDate, endDate);
        const trends = analyzeTrends(monthly);
        return {
          period: { start_date: startDate, end_date: endDate },
          spending_trend: trends.spending_trend,
          monthly_growth_rate: trends.monthly_growth_rate,
          peak_spending_month: trends.peak_spending_month,
          lowest_spending_month: trends.lowest_spending_month,
        };
      },
    }),

    searchTransactions: tool({
      description:
        "Search and filter transactions by category, type, or date range. Returns a list of matching transactions.",
      inputSchema: z.object({
        category: z
          .string()
          .optional()
          .describe("Filter by category name (case-insensitive partial match)"),
        type: z
          .enum(["INCOME", "EXPENSE"])
          .optional()
          .describe("Filter by transaction type"),
        start_date: z
          .string()
          .optional()
          .describe("Start date in YYYY-MM-DD format"),
        end_date: z
          .string()
          .optional()
          .describe("End date in YYYY-MM-DD format"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of transactions to return (default 10)"),
      }),
      execute: async ({ category, type, start_date, end_date, limit }) => {
        const startDate = start_date || dateRange.start_date;
        const endDate = end_date || dateRange.end_date;
        const limitNum = limit || 10;

        let transactions = getFilteredTransactions(pocketId, startDate, endDate);

        // Filter by type if specified
        if (type) {
          transactions = transactions.filter((t) => t.type === type);
        }

        // Filter by category if specified (case-insensitive partial match)
        if (category) {
          const categoryLower = category.toLowerCase();
          transactions = transactions.filter((t) =>
            t.category.toLowerCase().includes(categoryLower)
          );
        }

        // Sort by date descending and limit
        transactions = transactions
          .sort(
            (a, b) =>
              new Date(b.transaction_date).getTime() -
              new Date(a.transaction_date).getTime()
          )
          .slice(0, limitNum);

        return {
          period: { start_date: startDate, end_date: endDate },
          filters: { category, type },
          count: transactions.length,
          transactions: transactions.map((t) => ({
            id: t.id,
            date: t.transaction_date,
            type: t.type,
            category: t.category,
            amount: t.amount,
            amount_formatted: formatCurrency(t.amount),
          })),
        };
      },
    }),

    getDatasetInfo: tool({
      description:
        "Get information about the available transaction dataset including date range and total records",
      inputSchema: z.object({}),
      execute: async () => {
        const range = getDatasetDateRange();
        const transactions = getFilteredTransactions(
          pocketId,
          range.start_date,
          range.end_date
        );
        return {
          start_date: range.start_date,
          end_date: range.end_date,
          total_transactions: transactions.length,
          pocket_id: pocketId,
        };
      },
    }),
  };
}

/**
 * Process a chat message with tool calling
 */
export async function processChat(
  message: string,
  history: ChatMessage[],
  pocketId: string
): Promise<{ response: string; toolsUsed: string[] }> {
  if (!isChatAvailable()) {
    throw new Error(
      "Chat service is not available. Please configure OPENROUTER_API_KEY and OPENROUTER_MODEL."
    );
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
  const model = process.env.OPENROUTER_MODEL!;

  const tools = createTools(pocketId);

  // Convert history to AI SDK format
  const messages = [
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user" as const, content: message },
  ];

  const { text, toolCalls } = await generateText({
    model: openrouter.chat(model),
    system: CHAT_SYSTEM_PROMPT,
    messages,
    tools,
    stopWhen: stepCountIs(5), // Allow up to 5 tool call rounds
  });

  // Extract tool names that were used
  const toolsUsed = toolCalls?.map((tc) => tc.toolName) ?? [];

  return {
    response: text,
    toolsUsed: [...new Set(toolsUsed)], // Deduplicate
  };
}
