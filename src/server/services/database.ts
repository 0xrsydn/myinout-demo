import { Database } from "bun:sqlite";
import { join } from "path";

const dbPath = join(process.cwd(), "data", "transactions.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.exec("PRAGMA journal_mode = WAL");

export default db;
