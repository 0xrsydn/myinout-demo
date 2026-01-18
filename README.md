# MyInOut AI - Personal Financial Assistant

An AI-powered data analysis dashboard that helps users manage their personal finances through intelligent insights, spending summaries, and trend analysis.

## Features

- **Financial Dashboard**: View income, expenses, and net cashflow at a glance
- **Spending Analysis**: Interactive charts showing category breakdowns and monthly trends
- **Smart Insights**: AI-generated warnings, trends, and recommendations
- **Date Range Filtering**: Analyze data for specific time periods
- **LLM Enhancement**: Optional AI-powered deep analysis using OpenRouter

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun |
| Backend | Hono (TypeScript) |
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Validation | Zod |
| AI/LLM | Vercel AI SDK + OpenRouter |
| Testing | Vitest |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- Node.js 18+ (optional, for compatibility)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myinout-ai
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables (optional, for LLM features):
```bash
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

4. Start the development servers:
```bash
bun run dev
```

This will start:
- Backend API server on `http://localhost:3000`
- Frontend dev server on `http://localhost:5173`

### Running in Production

1. Build the frontend:
```bash
bun run build
```

2. Start the server:
```bash
bun run start
```

## Project Structure

```
myinout-ai/
├── src/
│   ├── client/                 # React frontend
│   │   ├── components/         # UI components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   └── lib/                # Utilities
│   │
│   ├── server/                 # Hono backend
│   │   ├── routes/             # API routes
│   │   └── services/           # Business logic
│   │       ├── analysis.ts     # Core calculations
│   │       ├── insights.ts     # Insight generation
│   │       ├── data-loader.ts  # Data loading/validation
│   │       └── llm.ts          # LLM integration
│   │
│   └── shared/                 # Shared types
│       └── types.ts
│
├── data/
│   └── transactions.json       # Transaction dataset
├── tests/                      # Unit tests
└── package.json
```

## API Documentation

### GET /api/v1/analysis

Get financial analysis for a wallet/pocket.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pocket_id | string | Yes | Wallet identifier |
| start_date | string | No | Start date (YYYY-MM-DD) |
| end_date | string | No | End date (YYYY-MM-DD) |
| include_llm | boolean | No | Enable LLM-enhanced insights |

**Example:**
```bash
curl "http://localhost:3000/api/v1/analysis?pocket_id=pocket_123&start_date=2024-01-01&end_date=2024-12-31"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-12-31"
    },
    "summary": {
      "total_income": 180000000,
      "total_expense": 150000000,
      "net_cashflow": 30000000,
      "transaction_count": 1000
    },
    "monthly_cashflow": [...],
    "expense_by_category": [...],
    "income_by_category": [...],
    "trends": {
      "spending_trend": "increasing",
      "monthly_growth_rate": 2.5,
      "peak_spending_month": "2024-06",
      "lowest_spending_month": "2024-02"
    },
    "insights": [...]
  },
  "meta": {
    "generated_at": "2024-01-15T10:30:00Z",
    "llm_enhanced": false
  }
}
```

### GET /api/v1/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "dataset": {
    "loaded": true,
    "totalTransactions": 10000,
    "walletIds": ["pocket_123"],
    "period": { "start_date": "2023-01-01", "end_date": "2024-12-31" }
  },
  "features": {
    "llm_available": true
  }
}
```

## Analysis Approach

### Data Processing
1. **Loading**: Transaction data is loaded from JSON and validated using Zod schemas
2. **Filtering**: Transactions are filtered by pocket_id and date range
3. **Aggregation**: Data is grouped by month, category, and type

### Analysis Methods

1. **Summary Calculation**
   - Total income/expense by summing transaction amounts
   - Net cashflow = income - expenses
   - Transaction count

2. **Trend Analysis**
   - Monthly growth rate using period comparison
   - Spending trend classification (increasing/decreasing/stable)
   - Peak and lowest spending month identification

3. **Category Breakdown**
   - Percentage calculation for each category
   - Sorted by amount (descending)

4. **Anomaly Detection**
   - Z-score method to detect unusual transactions
   - Transactions > 2 standard deviations flagged as anomalies

### Insight Generation

The system generates 5 types of insights:

1. **High Spending Warnings**: Categories exceeding 25% of total spending
2. **Trend Alerts**: Rising or falling spending patterns (>10% change)
3. **Savings Recommendations**: When savings rate < 20%
4. **Anomaly Alerts**: Unusual transaction detection
5. **Category Trends**: Month-over-month changes in specific categories

## Testing

Run the test suite:
```bash
bun run test
```

Run tests once (CI mode):
```bash
bun run test:run
```

### Test Coverage

Tests cover:
- `analysis.ts`: Summary calculation, monthly cashflow, category breakdown, trend analysis
- `insights.ts`: Insight generation logic for all insight types
- `formatters.ts`: Currency and date formatting

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| OPENROUTER_API_KEY | No | - | API key for LLM features |
| OPENROUTER_MODEL | No | anthropic/claude-3.5-sonnet | Model to use |
| PORT | No | 3000 | Server port |

## Future Development Ideas

1. **Multi-wallet Support**: Aggregate analysis across multiple wallets
2. **Budget Tracking**: Set and track spending budgets by category
3. **Export Functionality**: PDF/CSV export of analysis reports
4. **Notifications**: Email/push alerts for spending thresholds
5. **Predictive Analytics**: ML-based spending predictions
6. **Multi-currency**: Support for multiple currencies with conversion
7. **Recurring Transaction Detection**: Automatic identification of subscriptions

## License

This project was created as part of a take-home test assignment.
