/**
 * Format currency in Indonesian Rupiah format
 * Example: 1500000 -> "Rp 1.500.000"
 * Note: Rounds to nearest integer since IDR has no subunits in practice
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = rounded
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
 * Example: "2024-01" -> "January 2024"
 */
export function formatMonth(monthStr: string): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const parts = monthStr.split("-");
  const year = parts[0] ?? "";
  const month = parts[1] ?? "01";
  const monthIndex = parseInt(month, 10) - 1;

  return `${months[monthIndex]} ${year}`;
}

/**
 * Format a full date string
 * Example: "2024-01-15" -> "15 January 2024"
 */
export function formatDate(dateStr: string): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const parts = dateStr.split("-");
  const year = parts[0] ?? "";
  const month = parts[1] ?? "01";
  const day = parts[2] ?? "01";
  const monthIndex = parseInt(month, 10) - 1;

  return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`;
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
