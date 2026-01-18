/**
 * Format currency in Indonesian Rupiah format
 * Example: 1500000 -> "Rp 1.500.000"
 */
export function formatCurrency(amount: number): string {
  const formatted = amount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `Rp ${formatted}`;
}

/**
 * Format a number with thousand separators (no currency prefix)
 * Example: 10000 -> "10.000"
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Format a percentage value
 * Example: 25.5 -> "25.5%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date string to human readable format
 * Example: "2024-01" -> "Jan 2024"
 */
export function formatMonth(monthStr: string): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const parts = monthStr.split("-");
  const year = parts[0] ?? "";
  const month = parts[1] ?? "01";
  const monthIndex = parseInt(month, 10) - 1;

  return `${months[monthIndex]} ${year}`;
}

/**
 * Format a full date string
 * Example: "2024-01-15" -> "15 Jan 2024"
 */
export function formatDate(dateStr: string): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const parts = dateStr.split("-");
  const year = parts[0] ?? "";
  const month = parts[1] ?? "01";
  const day = parts[2] ?? "01";
  const monthIndex = parseInt(month, 10) - 1;

  return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`;
}

/**
 * Format a date string to short format for charts
 * Example: "2024-01-15" -> "15 Jan"
 */
export function formatDayShort(dateStr: string): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const parts = dateStr.split("-");
  const month = parts[1] ?? "01";
  const day = parts[2] ?? "01";
  const monthIndex = parseInt(month, 10) - 1;

  return `${parseInt(day, 10)} ${months[monthIndex]}`;
}

/**
 * Abbreviate large numbers for display (Indonesian format)
 * Example: 1500000 -> "1,5 Jt" (1.5 Juta/Million)
 * Example: 1500000000 -> "1,5 M" (1.5 Miliar/Billion)
 */
export function abbreviateNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(".", ",").replace(",0", "") + " M";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(".", ",").replace(",0", "") + " Jt";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(".", ",").replace(",0", "") + " Rb";
  }
  return num.toString();
}

/**
 * Format currency with abbreviation for charts (Indonesian format)
 * Example: 1500000 -> "Rp 1,5 Jt"
 */
export function formatCurrencyShort(amount: number): string {
  return `Rp ${abbreviateNumber(amount)}`;
}

/**
 * Get date presets for date range picker
 * @param datasetEndDate - Optional dataset end date (YYYY-MM-DD) to calculate presets relative to.
 *                         If not provided, uses current date.
 */
export function getDatePresets(datasetEndDate?: string) {
  const endDate = datasetEndDate ? new Date(datasetEndDate) : new Date();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  const endDay = endDate.getDate();

  return {
    allTime: {
      label: "All Time",
      startDate: undefined,
      endDate: undefined,
    },
    last6Months: {
      label: "Last 6 Months",
      startDate: new Date(endYear, endMonth - 5, 1)
        .toISOString()
        .split("T")[0],
      endDate: datasetEndDate,
    },
    last3Months: {
      label: "Last 3 Months",
      startDate: new Date(endYear, endMonth - 2, 1)
        .toISOString()
        .split("T")[0],
      endDate: datasetEndDate,
    },
    lastMonth: {
      label: "Last Month",
      startDate: `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`,
      endDate: datasetEndDate,
    },
    lastWeek: {
      label: "Last 7 Days",
      startDate: new Date(endYear, endMonth, endDay - 6)
        .toISOString()
        .split("T")[0],
      endDate: datasetEndDate,
    },
  };
}
