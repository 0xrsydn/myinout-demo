import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import analysisRoutes from "./routes/analysis";
import chatRoutes from "./routes/chat";
import { getDatasetStats, isDatabaseSeeded } from "./services/data-loader";
import { isLLMAvailable } from "./services/llm";
import { isChatAvailable } from "./services/chat";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:5173", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// Health check endpoint
app.get("/api/v1/health", (c) => {
  try {
    const stats = getDatasetStats();
    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      dataset: {
        loaded: true,
        ...stats,
      },
      features: {
        llm_available: isLLMAvailable(),
      },
    });
  } catch (error) {
    return c.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Analysis routes
app.route("/api/v1/analysis", analysisRoutes);

// Chat routes
app.route("/api/v1/chat", chatRoutes);

// Serve static files from the built frontend in production
app.use("/*", serveStatic({ root: "./dist" }));

// Fallback to index.html for SPA routing
app.get("*", serveStatic({ path: "./dist/index.html" }));

// Check database on startup
console.log("Checking database...");
if (!isDatabaseSeeded()) {
  console.error("Database not seeded! Run 'bun run seed' first.");
  process.exit(1);
}
console.log("Database ready!");

const port = parseInt(process.env.PORT || "3000", 10);

console.log(`Server starting on http://localhost:${port}`);
console.log(`LLM features: ${isLLMAvailable() ? "enabled" : "disabled (set OPENROUTER_API_KEY to enable)"}`);
console.log(`Chat service: ${isChatAvailable() ? "enabled" : "disabled (set OPENROUTER_API_KEY and OPENROUTER_MODEL to enable)"}`);

export default {
  port,
  fetch: app.fetch,
  idleTimeout: 60, // Allow 60 seconds for LLM API requests
};
