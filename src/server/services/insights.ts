import type {
  Transaction,
  Insight,
  CategoryBreakdown,
  TrendAnalysis,
  MonthlyCashflow,
  Summary,
} from "../../shared/types";
import {
  detectAnomalies,
  getCategoryMonthlyTrend,
} from "./analysis";
import { formatCurrency } from "./formatters";

const HIGH_SPENDING_THRESHOLD = 25; // Category > 25% is considered high
const GROWTH_WARNING_THRESHOLD = 10; // > 10% growth triggers warning
const SAVINGS_RATE_THRESHOLD = 20; // Less than 20% savings is concerning

const CATEGORY_LABELS: Record<string, string> = {
  // Expense categories
  food: "Makanan",
  entertainment: "Hiburan",
  utilities: "Utilitas/Tagihan",
  transport: "Transportasi",
  shopping: "Belanja",
  education: "Pendidikan",
  health: "Kesehatan",
  other: "Lainnya",

  // Income categories
  salary: "Gaji",
  freelance: "Freelance",
  bonus: "Bonus",
  investment: "Investasi",
};

function formatCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? toTitleCase(category.replace(/_/g, " "));
}

function toTitleCase(str: string): string {
  return str
    .split(" ")
    .filter(Boolean)
    .map((part) => capitalize(part))
    .join(" ");
}

/**
 * Generate all insights based on analysis results
 */
export function generateInsights(
  walletId: string,
  startDate: string,
  endDate: string,
  summary: Summary,
  expenseByCategory: CategoryBreakdown[],
  incomeByCategory: CategoryBreakdown[],
  trends: TrendAnalysis,
  monthlyCashflow: MonthlyCashflow[]
): Insight[] {
  const insights: Insight[] = [];

  // 1. High spending category warnings
  insights.push(...generateHighSpendingInsights(expenseByCategory, summary));

  // 2. Spending trend insights
  insights.push(...generateTrendInsights(trends, monthlyCashflow));

  // 3. Savings rate recommendations
  insights.push(...generateSavingsInsights(summary));

  // 4. Anomaly detection insights
  insights.push(...generateAnomalyInsights(walletId, startDate, endDate));

  // 5. Category-specific trend insights
  insights.push(...generateCategoryTrendInsights(walletId, startDate, endDate, expenseByCategory));

  // 6. Income diversity insights
  insights.push(...generateIncomeDiversityInsights(incomeByCategory));

  // Limit to top 5 most relevant insights
  return insights.slice(0, 5);
}

/**
 * Generate warnings for high spending categories
 */
function generateHighSpendingInsights(
  expenseByCategory: CategoryBreakdown[],
  summary: Summary
): Insight[] {
  const insights: Insight[] = [];

  for (const category of expenseByCategory) {
    if (category.percentage >= HIGH_SPENDING_THRESHOLD) {
      const categoryLabel = formatCategoryLabel(category.category);

      insights.push({
        type: "warning",
        title: `Pengeluaran ${categoryLabel} Tinggi`,
        message: `Pengeluaran kategori ${categoryLabel} mencapai ${category.percentage}% dari total pengeluaran`,
        deep_analysis: `Dalam periode yang dianalisis, pengeluaran ${categoryLabel} mencapai ${formatCurrency(category.amount)}, menjadikannya ${category.percentage >= 30 ? "kategori terbesar" : "kategori yang signifikan"} dengan ${category.transaction_count} transaksi. Pertimbangkan meninjau pengeluaran ${categoryLabel} yang berulang untuk menemukan peluang penghematan.`,
      });
    }
  }

  return insights;
}

/**
 * Generate insights about spending trends
 */
function generateTrendInsights(
  trends: TrendAnalysis,
  monthlyCashflow: MonthlyCashflow[]
): Insight[] {
  const insights: Insight[] = [];

  if (
    trends.spending_trend === "increasing" &&
    trends.monthly_growth_rate > GROWTH_WARNING_THRESHOLD
  ) {
    insights.push({
      type: "trend",
      title: "Tren Pengeluaran Meningkat",
      message: `Total pengeluaran meningkat ${trends.monthly_growth_rate}% selama periode analisis`,
      deep_analysis: `Data menunjukkan tren kenaikan pengeluaran yang cukup konsisten. Puncak pengeluaran terjadi pada ${trends.peak_spending_month} sementara yang terendah pada ${trends.lowest_spending_month}. Jika dibiarkan, tren ini dapat menekan target tabungan jangka panjang.`,
    });
  } else if (trends.spending_trend === "decreasing") {
    insights.push({
      type: "trend",
      title: "Pengeluaran Mulai Terkendali",
      message: `Kabar baik! Total pengeluaran turun ${Math.abs(trends.monthly_growth_rate)}% selama periode analisis`,
      deep_analysis: `Pengendalian pengeluaran Anda mulai terlihat. Bulan dengan pengeluaran terendah adalah ${trends.lowest_spending_month}. Pertahankan kebiasaan ini agar tabungan makin kuat.`,
    });
  }

  // Volatility insight
  if (monthlyCashflow.length >= 3) {
    const expenses = monthlyCashflow.map((m) => m.expense);
    const avg = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    const variance = expenses.reduce((sum, e) => sum + Math.pow(e - avg, 2), 0) / expenses.length;
    const coefficientOfVariation = (Math.sqrt(variance) / avg) * 100;

    if (coefficientOfVariation > 30) {
      insights.push({
        type: "warning",
        title: "Pola Pengeluaran Tidak Konsisten",
        message: `Pengeluaran bulanan Anda berfluktuasi cukup besar (~${Math.round(coefficientOfVariation)}%)`,
        deep_analysis: `Fluktuasi pengeluaran yang besar dapat menyulitkan penganggaran. Coba identifikasi pengeluaran yang tidak rutin (mis. bayar tahunan/sekali-sekali) dan alokasikan pos khusus agar arus kas lebih stabil.`,
      });
    }
  }

  return insights;
}

/**
 * Generate savings-related recommendations
 */
function generateSavingsInsights(summary: Summary): Insight[] {
  const insights: Insight[] = [];

  if (summary.total_income === 0) {
    return insights;
  }

  const savingsRate = ((summary.net_cashflow / summary.total_income) * 100);

  if (savingsRate < 0) {
    insights.push({
      type: "warning",
      title: "Arus Kas Negatif",
      message: `Pengeluaran Anda melebihi pendapatan sebesar ${formatCurrency(Math.abs(summary.net_cashflow))}`,
      deep_analysis: `Dalam periode ini, total pengeluaran lebih besar daripada pemasukan sehingga berisiko jika berlanjut. Tinjau kategori pengeluaran terbesar dan tentukan pos yang bisa ditekan untuk kembali ke arus kas positif.`,
    });
  } else if (savingsRate < SAVINGS_RATE_THRESHOLD) {
    insights.push({
      type: "recommendation",
      title: "Peluang Meningkatkan Tabungan",
      message: `Tingkat tabungan saat ini ${Math.round(savingsRate)}%, di bawah rekomendasi 20%`,
      deep_analysis: `Umumnya disarankan menabung minimal 20% dari pendapatan. Saat ini Anda menyisihkan sekitar ${formatCurrency(summary.net_cashflow)} per periode. Mengurangi pengeluaran yang fleksibel (mis. belanja/hiburan) bisa meningkatkan kesehatan finansial secara signifikan.`,
    });
  } else {
    insights.push({
      type: "trend",
      title: "Tingkat Tabungan Sehat",
      message: `Bagus! Anda menabung sekitar ${Math.round(savingsRate)}% dari pendapatan`,
      deep_analysis: `Tingkat tabungan Anda (${Math.round(savingsRate)}%) sudah melampaui patokan 20%. Selama periode ini Anda membangun tabungan sebesar ${formatCurrency(summary.net_cashflow)}. Pertahankan konsistensinya agar target finansial lebih cepat tercapai.`,
    });
  }

  return insights;
}

/**
 * Generate insights from anomaly detection
 */
function generateAnomalyInsights(
  walletId: string,
  startDate: string,
  endDate: string
): Insight[] {
  const insights: Insight[] = [];

  const expenseAnomalies = detectAnomalies(walletId, startDate, endDate, "EXPENSE");
  const incomeAnomalies = detectAnomalies(walletId, startDate, endDate, "INCOME");

  if (expenseAnomalies.length > 0) {
    const totalAnomaly = expenseAnomalies.reduce((sum, tx) => sum + tx.amount, 0);
    const categories = [...new Set(expenseAnomalies.map((tx) => tx.category))];

    insights.push({
      type: "warning",
      title: "Terdeteksi Pengeluaran Tidak Biasa",
      message: `Ditemukan ${expenseAnomalies.length} transaksi pengeluaran yang tidak biasa dengan total ${formatCurrency(totalAnomaly)}`,
      deep_analysis: `Nilai transaksi ini jauh lebih tinggi dibandingkan pola pengeluaran Anda. Kategori yang terdampak: ${categories.map((c) => formatCategoryLabel(c)).join(", ")}. Periksa kembali transaksi tersebut untuk memastikan memang diperlukan, serta cek apakah ada yang berulang.`,
    });
  }

  if (incomeAnomalies.length > 0) {
    const totalAnomaly = incomeAnomalies.reduce((sum, tx) => sum + tx.amount, 0);

    insights.push({
      type: "trend",
      title: "Pendapatan Tidak Biasa Terdeteksi",
      message: `Ditemukan ${incomeAnomalies.length} transaksi pendapatan yang tidak biasa dengan total ${formatCurrency(totalAnomaly)}`,
      deep_analysis: `Nilai pemasukan ini jauh lebih tinggi dibandingkan biasanya. Jika ini bersifat sekali saja (mis. bonus besar), pertimbangkan mengalokasikan sebagian ke tabungan atau investasi agar manfaatnya lebih jangka panjang.`,
    });
  }

  return insights;
}

/**
 * Generate insights about category-specific trends
 */
function generateCategoryTrendInsights(
  walletId: string,
  startDate: string,
  endDate: string,
  expenseByCategory: CategoryBreakdown[]
): Insight[] {
  const insights: Insight[] = [];

  // Check top 3 expense categories for rising trends
  const topCategories = expenseByCategory.slice(0, 3);

  for (const category of topCategories) {
    const trend = getCategoryMonthlyTrend(walletId, startDate, endDate, category.category);

    if (trend.length >= 3) {
      // Compare last 3 months with first 3 months
      const firstThree = trend.slice(0, 3);
      const lastThree = trend.slice(-3);

      const firstAvg = firstThree.reduce((a, b) => a + b.amount, 0) / 3;
      const lastAvg = lastThree.reduce((a, b) => a + b.amount, 0) / 3;

      if (firstAvg > 0) {
        const growth = ((lastAvg - firstAvg) / firstAvg) * 100;

        if (growth > 15) {
          const categoryLabel = formatCategoryLabel(category.category);

          insights.push({
            type: "trend",
            title: `Biaya ${categoryLabel} Meningkat`,
            message: `Pengeluaran ${categoryLabel} meningkat ${Math.round(growth)}% selama periode analisis`,
            deep_analysis: `Rata-rata pengeluaran ${categoryLabel} naik dari ${formatCurrency(firstAvg)} menjadi ${formatCurrency(lastAvg)} per bulan. Tren ini perlu diperhatikan agar tidak menyebabkan pembengkakan anggaran di bulan-bulan berikutnya.`,
          });
        } else if (growth < -15) {
          const categoryLabel = formatCategoryLabel(category.category);

          insights.push({
            type: "recommendation",
            title: `Penghematan ${categoryLabel} Tercapai`,
            message: `Pengeluaran ${categoryLabel} turun ${Math.round(Math.abs(growth))}%`,
            deep_analysis: `Rata-rata pengeluaran ${categoryLabel} berkurang dari ${formatCurrency(firstAvg)} menjadi ${formatCurrency(lastAvg)} per bulan. Pertahankan strategi yang sama untuk menjaga pengeluaran di kategori ini tetap terkendali.`,
          });
        }
      }
    }
  }

  return insights;
}

/**
 * Generate insights about income diversity
 */
function generateIncomeDiversityInsights(
  incomeByCategory: CategoryBreakdown[]
): Insight[] {
  const insights: Insight[] = [];

  if (incomeByCategory.length === 0) {
    return insights;
  }

  // Check if income is too concentrated
  const topIncome = incomeByCategory[0];

  if (topIncome && topIncome.percentage > 90 && incomeByCategory.length === 1) {
    const incomeLabel = formatCategoryLabel(topIncome.category);

    insights.push({
      type: "recommendation",
      title: "Diversifikasi Sumber Pendapatan",
      message: `${topIncome.percentage}% pendapatan berasal dari ${incomeLabel}`,
      deep_analysis: `Memiliki satu sumber pendapatan utama saja bisa berisiko. Pertimbangkan menambah sumber pendapatan lain seperti freelance, investasi, atau proyek sampingan untuk meningkatkan ketahanan finansial.`,
    });
  } else if (incomeByCategory.length >= 3) {
    insights.push({
      type: "trend",
      title: "Sumber Pendapatan Beragam",
      message: `Anda memiliki ${incomeByCategory.length} sumber pendapatan`,
      deep_analysis: `Memiliki beberapa sumber pendapatan membantu menjaga stabilitas finansial. Pertahankan diversifikasi ini untuk mengurangi dampak jika salah satu sumber pendapatan menurun.`,
    });
  }

  return insights;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
