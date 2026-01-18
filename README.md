# MyInOut AI - Personal Finance Analyzer

AI-powered financial analysis API that processes transaction data to provide spending insights, trend analysis, and recommendations.

## Quick Start

```bash
bun install
bun run dev
```

- **API**: http://localhost:3000
- **UI**: http://localhost:5173

## LLM Features (Optional)

For AI-enhanced insights and chat:
```bash
cp .env.example .env
# Add your OPENROUTER_API_KEY
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/analysis?pocket_id=...` | Financial analysis (add `start_date`, `end_date`, `include_llm` as needed) |
| `GET /api/v1/health` | Health check & dataset info |
| `POST /api/v1/chat` | AI chat assistant (requires LLM config) |

## Analysis Features

- Income/expense summary & net cashflow
- Monthly trends and spending patterns
- Category breakdown with percentages
- Anomaly detection (Z-score)
- AI-generated insights: warnings, trends, recommendations

## Testing

```bash
bun run test:run
```

## Tech Stack

Bun, Hono, React, Vite, Tailwind, Recharts, Zod, Vercel AI SDK, SQLite
