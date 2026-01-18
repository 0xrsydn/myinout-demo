/**
 * Seed script to convert transactions.json to SQLite database
 * Run with: bun run scripts/seed-db.ts
 */

import { Database } from "bun:sqlite";
import { join } from "path";
import { existsSync, unlinkSync } from "fs";

const JSON_PATH = join(process.cwd(), "data", "transactions.json");
const DB_PATH = join(process.cwd(), "data", "transactions.db");

interface Transaction {
  id: number;
  wallet_id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  currency: string;
  transaction_date: string;
  created_at: string;
}

interface Dataset {
  meta: {
    description: string;
    wallet_id: string;
    currency: string;
    total_transactions: number;
    period: {
      start_date: string;
      end_date: string;
    };
  };
  transactions: Transaction[];
}

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // Check if JSON file exists
  if (!existsSync(JSON_PATH)) {
    console.error("❌ Error: transactions.json not found at", JSON_PATH);
    process.exit(1);
  }

  // Remove existing database if it exists
  if (existsSync(DB_PATH)) {
    console.log("🗑️  Removing existing database...");
    unlinkSync(DB_PATH);
    // Also remove WAL files if they exist
    if (existsSync(DB_PATH + "-wal")) unlinkSync(DB_PATH + "-wal");
    if (existsSync(DB_PATH + "-shm")) unlinkSync(DB_PATH + "-shm");
  }

  // Read JSON data
  console.log("📖 Reading transactions.json...");
  const jsonFile = Bun.file(JSON_PATH);
  const data: Dataset = await jsonFile.json();
  console.log(`   Found ${data.transactions.length} transactions\n`);

  // Create database
  console.log("🗄️  Creating SQLite database...");
  const db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.exec("PRAGMA journal_mode = WAL");

  // Create tables
  console.log("📋 Creating tables...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY,
      wallet_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('INCOME', 'EXPENSE')),
      category TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL,
      transaction_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Create indexes
  console.log("🔍 Creating indexes...");
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_wallet_id ON transactions(wallet_id);
    CREATE INDEX IF NOT EXISTS idx_wallet_date ON transactions(wallet_id, transaction_date);
    CREATE INDEX IF NOT EXISTS idx_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_category ON transactions(category);
    CREATE INDEX IF NOT EXISTS idx_transaction_date ON transactions(transaction_date);
  `);

  // Insert meta data
  console.log("📝 Inserting meta data...");
  const insertMeta = db.prepare("INSERT INTO meta (key, value) VALUES (?, ?)");
  insertMeta.run("description", data.meta.description);
  insertMeta.run("wallet_id", data.meta.wallet_id);
  insertMeta.run("currency", data.meta.currency);
  insertMeta.run("total_transactions", String(data.meta.total_transactions));
  insertMeta.run("start_date", data.meta.period.start_date);
  insertMeta.run("end_date", data.meta.period.end_date);

  // Insert transactions using a prepared statement and transaction for speed
  console.log("💾 Inserting transactions (this may take a moment)...");
  const insertTx = db.prepare(`
    INSERT INTO transactions (id, wallet_id, type, category, amount, currency, transaction_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const startTime = performance.now();

  // Use a transaction for bulk insert (much faster)
  db.exec("BEGIN TRANSACTION");
  for (const tx of data.transactions) {
    insertTx.run(
      tx.id,
      tx.wallet_id,
      tx.type,
      tx.category,
      tx.amount,
      tx.currency,
      tx.transaction_date,
      tx.created_at
    );
  }
  db.exec("COMMIT");

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
  console.log(`   Inserted ${data.transactions.length} transactions in ${elapsed}s\n`);

  // Verify the data
  console.log("✅ Verifying data...");
  const count = db.query("SELECT COUNT(*) as count FROM transactions").get() as { count: number };
  const incomeSum = db.query("SELECT SUM(amount) as total FROM transactions WHERE type = 'INCOME'").get() as { total: number };
  const expenseSum = db.query("SELECT SUM(amount) as total FROM transactions WHERE type = 'EXPENSE'").get() as { total: number };

  console.log(`   Total transactions: ${count.count}`);
  console.log(`   Total income: Rp ${incomeSum.total.toLocaleString()}`);
  console.log(`   Total expense: Rp ${expenseSum.total.toLocaleString()}`);
  console.log(`   Net cashflow: Rp ${(incomeSum.total - expenseSum.total).toLocaleString()}`);

  db.close();

  console.log("\n🎉 Database seeded successfully!");
  console.log(`   Database file: ${DB_PATH}`);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
