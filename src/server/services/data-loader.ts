import type { Transaction } from "../../shared/types";
import db from "./database";

/**
 * Get transactions filtered by wallet_id and date range using SQL
 */
export function getFilteredTransactions(
  walletId: string,
  startDate?: string,
  endDate?: string
): Transaction[] {
  let query = "SELECT * FROM transactions WHERE wallet_id = ?";
  const params: (string | number)[] = [walletId];

  if (startDate) {
    query += " AND transaction_date >= ?";
    params.push(startDate);
  }

  if (endDate) {
    query += " AND transaction_date <= ?";
    params.push(endDate);
  }

  query += " ORDER BY transaction_date ASC";

  return db.query(query).all(...params) as Transaction[];
}

/**
 * Get the date range from the dataset
 */
export function getDatasetDateRange(): { start_date: string; end_date: string } {
  const startDate = db
    .query("SELECT value FROM meta WHERE key = 'start_date'")
    .get() as { value: string } | null;
  const endDate = db
    .query("SELECT value FROM meta WHERE key = 'end_date'")
    .get() as { value: string } | null;

  if (!startDate || !endDate) {
    // Fallback: calculate from actual data
    const range = db
      .query(
        "SELECT MIN(transaction_date) as start_date, MAX(transaction_date) as end_date FROM transactions"
      )
      .get() as { start_date: string; end_date: string };
    return range;
  }

  return {
    start_date: startDate.value,
    end_date: endDate.value,
  };
}

/**
 * Get all unique wallet IDs in the dataset
 */
export function getWalletIds(): string[] {
  const results = db
    .query("SELECT DISTINCT wallet_id FROM transactions")
    .all() as { wallet_id: string }[];
  return results.map((r) => r.wallet_id);
}

/**
 * Get basic stats about the dataset (for health check)
 */
export function getDatasetStats(): {
  totalTransactions: number;
  walletIds: string[];
  period: { start_date: string; end_date: string };
  currency: string;
} {
  const count = db
    .query("SELECT COUNT(*) as count FROM transactions")
    .get() as { count: number };

  const currency = db
    .query("SELECT value FROM meta WHERE key = 'currency'")
    .get() as { value: string } | null;

  return {
    totalTransactions: count.count,
    walletIds: getWalletIds(),
    period: getDatasetDateRange(),
    currency: currency?.value ?? "IDR",
  };
}

/**
 * Check if the database is properly seeded
 */
export function isDatabaseSeeded(): boolean {
  try {
    const count = db
      .query("SELECT COUNT(*) as count FROM transactions")
      .get() as { count: number };
    return count.count > 0;
  } catch {
    return false;
  }
}
