import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import type { Insight, Summary, CategoryBreakdown } from "../../shared/types";
import { formatCurrency } from "./formatters";

const SYSTEM_PROMPT = `Anda adalah asisten keuangan pribadi yang membantu pengguna memahami pola pengeluaran dan membuat keputusan finansial yang lebih baik.

Penting:
- Selalu tulis dalam Bahasa Indonesia
- Format mata uang sebagai Rupiah (Rp X.XXX.XXX)
- Sertakan persentase untuk konteks bila relevan
- Ringkas tapi informatif
- Berikan saran yang spesifik dan bisa dilakukan
- Gunakan nada profesional namun ramah

Fokus pada:
- Mengidentifikasi pola pengeluaran/pendapatan
- Menyoroti area yang perlu diwaspadai
- Memberi rekomendasi yang actionable`;

/**
 * Check if LLM service is available
 */
export function isLLMAvailable(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

/**
 * Get the OpenRouter client
 */
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }

  return createOpenRouter({
    apiKey,
  });
}

/**
 * Enhance a single insight with LLM-generated deep analysis
 */
export async function enhanceInsight(
  insight: Insight,
  context: {
    summary: Summary;
    expenseByCategory: CategoryBreakdown[];
    incomeByCategory: CategoryBreakdown[];
  }
): Promise<Insight> {
  if (!isLLMAvailable()) {
    return insight;
  }

  try {
    const openrouter = getOpenRouterClient();
    const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

    const contextStr = buildContextString(context);

    console.log(`[LLM] --> Calling OpenRouter (model: ${model}) for insight enhancement`);
    const { text } = await generateText({
      model: openrouter.chat(model),
      system: SYSTEM_PROMPT,
       prompt: `Tingkatkan insight keuangan berikut dengan analisis mendalam 2-3 kalimat dalam Bahasa Indonesia yang menjelaskan signifikansinya dan memberi saran yang bisa dilakukan.

Insight Type: ${insight.type}
Title: ${insight.title}
Message: ${insight.message}

Konteks Finansial:
${contextStr}

Buat deep analysis yang:
1. Menjelaskan mengapa ini penting bagi kesehatan finansial pengguna
2. Memberi rekomendasi yang spesifik dan actionable
3. Menggunakan angka konkret dari konteks bila relevan

Batasi 2-3 kalimat, profesional namun ramah.`,
    });
    console.log(`[LLM] <-- OpenRouter response received`);

    return {
      ...insight,
      deep_analysis: text,
    };
  } catch (error) {
    console.error("Error enhancing insight with LLM:", error);
    return insight;
  }
}

/**
 * Enhance multiple insights with LLM
 */
export async function enhanceInsights(
  insights: Insight[],
  context: {
    summary: Summary;
    expenseByCategory: CategoryBreakdown[];
    incomeByCategory: CategoryBreakdown[];
  }
): Promise<Insight[]> {
  if (!isLLMAvailable()) {
    return insights;
  }

  // Process insights in parallel for speed
  const enhancedInsights = await Promise.all(
    insights.map((insight) => enhanceInsight(insight, context))
  );

  return enhancedInsights;
}

/**
 * Generate a comprehensive financial summary using LLM
 */
export async function generateLLMSummary(
  context: {
    summary: Summary;
    expenseByCategory: CategoryBreakdown[];
    incomeByCategory: CategoryBreakdown[];
    insights: Insight[];
  }
): Promise<string | null> {
  if (!isLLMAvailable()) {
    return null;
  }

  try {
    const openrouter = getOpenRouterClient();
    const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet";

    const contextStr = buildContextString(context);
    const insightsStr = context.insights
      .map((i) => `- ${i.title}: ${i.message}`)
      .join("\n");

    console.log(`[LLM] --> Calling OpenRouter (model: ${model}) for summary generation`);
     const { text } = await generateText({
       model: openrouter.chat(model),
       system: SYSTEM_PROMPT,
       prompt: `Berdasarkan data keuangan berikut, buat ringkasan singkat (3-4 kalimat) mengenai kesehatan finansial pengguna dalam Bahasa Indonesia.

Konteks Finansial:
${contextStr}

Insight Utama:
${insightsStr}

Rangkum situasi keuangan pengguna secara membantu dan suportif, sambil menyoroti area yang perlu perhatian.`,
     });
    console.log(`[LLM] <-- OpenRouter response received`);

    return text;
  } catch (error) {
    console.error("Error generating LLM summary:", error);
    return null;
  }
}

/**
 * Build context string for LLM prompts
 */
function buildContextString(context: {
  summary: Summary;
  expenseByCategory: CategoryBreakdown[];
  incomeByCategory: CategoryBreakdown[];
}): string {
  const { summary, expenseByCategory, incomeByCategory } = context;

  const savingsRate = summary.total_income > 0
    ? ((summary.net_cashflow / summary.total_income) * 100).toFixed(1)
    : "0";

  const topExpenses = expenseByCategory
    .slice(0, 3)
    .map((c) => `${c.category}: ${formatCurrency(c.amount)} (${c.percentage}%)`)
    .join(", ");

  const topIncome = incomeByCategory
    .slice(0, 3)
    .map((c) => `${c.category}: ${formatCurrency(c.amount)} (${c.percentage}%)`)
    .join(", ");

  return `
Total Income: ${formatCurrency(summary.total_income)}
Total Expenses: ${formatCurrency(summary.total_expense)}
Net Cashflow: ${formatCurrency(summary.net_cashflow)}
Savings Rate: ${savingsRate}%
Transaction Count: ${summary.transaction_count}
Top Expense Categories: ${topExpenses}
Top Income Sources: ${topIncome}
  `.trim();
}
