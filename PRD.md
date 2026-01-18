# Product Requirements Document (PRD)
## MyInOut AI - Personal Financial Assistant

---

## 1. Overview

### 1.1 Product Summary
MyInOut AI is a data analysis dashboard with AI-powered insights that helps users manage their personal finances. Users can view spending summaries, analyze trends, and receive intelligent recommendations to make better financial decisions.

### 1.2 Problem Statement
Managing personal finances requires users to manually analyze transaction data, categorize expenses, and identify spending patterns. This is time-consuming and often leads to missed insights about financial behavior.

### 1.3 Solution
A data analysis dashboard that:
- Provides instant spending summaries and analysis
- Visualizes income vs expense trends with interactive charts
- Identifies unusual patterns and provides proactive insights
- Offers AI-enhanced recommendations for better financial decisions

---

## 2. Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Bun | Fast JavaScript runtime, built-in bundler |
| Backend | Hono | Lightweight, fast, TypeScript-first web framework |
| Frontend | React + Vite | Modern SPA with fast HMR |
| UI Components | ShadCN/UI + Tailwind | Accessible, customizable components |
| Charts | Recharts | React-native charting library |
| AI/LLM | Vercel AI SDK + OpenRouter | Type-safe AI integration, multi-model support |
| Data Storage | JSON file | Simple for 10K records, no DB setup needed |

---

## 3. Data Model

### 3.1 Source Data
File: `data/transactions.json` (copied from `money_tracker_dataset_10k.txt`)

### 3.2 Transaction Schema
```json
{
  "id": 1,
  "wallet_id": "pocket_123",
  "type": "EXPENSE | INCOME",
  "category": "string",
  "amount": 1607721,
  "currency": "IDR",
  "transaction_date": "2023-05-30",
  "created_at": "2026-01-15T08:12:08.276662"
}
```

### 3.3 Categories (from dataset)
**Expense Categories:**
- utilities
- entertainment
- education
- transport
- food
- shopping
- health
- other

**Income Categories:**
- salary
- freelance
- investment
- bonus
- other

### 3.4 Dataset Statistics
- Total Transactions: 10,000
- Period: 2023-01-01 to 2024-12-31
- Currency: IDR (Indonesian Rupiah)

---

## 4. Features

### 4.1 Core Features (MVP)

#### 4.1.1 Financial Dashboard
Users can view their financial data at a glance:
- Total income and expenses for selected period
- Net cashflow (income - expenses)
- Transaction count

#### 4.1.2 Spending Analysis
- Total spending by category (pie chart)
- Monthly cashflow trends (line/bar chart)
- Income vs expense comparison
- Top expense categories

#### 4.1.3 Date Range Filtering
- Select custom date ranges (start_date, end_date)
- Preset options: This Month, Last 3 Months, This Year, All Time
- Real-time data updates

#### 4.1.4 Formatted Responses
- Display amounts in IDR with proper formatting (Rp 1.500.000)
- Show percentages for category breakdowns
- Present data in tables and charts

### 4.2 Extended Features (Nice-to-have)

#### 4.2.1 AI-Powered Insights
- Anomaly detection (unusual transactions via Z-score)
- Spending trend analysis and predictions
- Personalized recommendations for savings

#### 4.2.2 Period Comparison
- Compare spending between different time periods
- Year-over-year analysis
- Monthly growth rates

#### 4.2.3 Proactive Insights
- Suggest areas to reduce spending
- Highlight positive trends
- Warning alerts for high spending categories

---

## 5. User Interface

### 5.1 Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  MyInOut AI - Financial Dashboard                           │
├─────────────────────────────────────────────────────────────┤
│  [Date Range Picker: Start Date] [End Date] [Apply]         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Total Income │ │Total Expense │ │ Net Cashflow │        │
│  │ Rp 180.000.000│ │Rp 150.000.000│ │ Rp 30.000.000│        │
│  │     ↑ 12%    │ │     ↑ 8%     │ │     ↑ 25%    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐    │
│  │          Monthly Cashflow (Line Chart)              │    │
│  │  ████                                               │    │
│  │  ██████████                                         │    │
│  │  ████████████████                                   │    │
│  │  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug             │    │
│  └────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Expense by       │  │ Income by        │                │
│  │ Category (Pie)   │  │ Category (Pie)   │                │
│  │   ┌───┐          │  │   ┌───┐          │                │
│  │   │ ● │ Food 30% │  │   │ ● │Salary 80%│                │
│  │   └───┘          │  │   └───┘          │                │
│  └──────────────────┘  └──────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│  Insights                                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ⚠️ Warning: High Food Spending                      │    │
│  │ Food expenses account for 30% of total spending     │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 📈 Trend: Rising Transport Costs                    │    │
│  │ Transport spending increased 15% over 3 months      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 💡 Recommendation: Savings Opportunity              │    │
│  │ Reducing entertainment could save Rp 2.4M/month     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 UI Components
- **Header**: App title
- **Date Range Picker**: Start/end date selection with presets
- **Summary Cards**: Income, expense, net cashflow with trend indicators
- **Charts**: Monthly cashflow (line), category breakdown (pie)
- **Insight Cards**: Warning (yellow), trend (blue), recommendation (green)
- **Loading State**: Skeleton loaders while data loads

### 5.3 React + ShadCN/UI Components
- `Card` - Summary cards, insight cards
- `Button` - Actions, date presets
- `Calendar` + `Popover` - Date range picker
- `Badge` - Insight type indicators
- `Skeleton` - Loading states

---

## 6. Architecture

### 6.1 Project Structure
```
myinout-ai/
├── src/
│   ├── client/                    # React frontend
│   │   ├── components/
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── CashflowChart.tsx
│   │   │   ├── CategoryBreakdown.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   └── DateRangePicker.tsx
│   │   ├── hooks/
│   │   │   └── useAnalysis.ts
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       └── formatters.ts
│   │
│   ├── server/                    # Hono backend
│   │   ├── index.ts               # Entry point
│   │   ├── routes/
│   │   │   └── analysis.ts
│   │   └── services/
│   │       ├── data-loader.ts     # Load & validate JSON
│   │       ├── analysis.ts        # Core calculations
│   │       ├── insights.ts        # Insight generation
│   │       └── llm.ts             # OpenRouter integration
│   │
│   └── shared/                    # Shared types
│       └── types.ts
│
├── data/
│   └── transactions.json          # Transaction data
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### 6.2 Request Flow
```
User selects date range → React Dashboard → API Request
                                              ↓
                                      Hono API Endpoint
                                              ↓
                                     Analysis Service
                                              ↓
                                   Data Loader (filter by date)
                                              ↓
                                   Calculate totals, trends
                                              ↓
                                   Insights Service (+ optional LLM)
                                              ↓
                                      Return JSON Response
                                              ↓
                                   Update React UI (charts, cards)
```

---

## 7. API Endpoints

### 7.1 Routes

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/api/v1/analysis` | Get financial analysis | JSON (AnalysisResult) |
| GET | `/api/v1/health` | Health check | JSON |

### 7.2 GET /api/v1/analysis

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| pocket_id | string | Yes | - | Wallet identifier (pocket_123) |
| start_date | string | No | Dataset start | Start date (YYYY-MM-DD) |
| end_date | string | No | Dataset end | End date (YYYY-MM-DD) |
| include_llm | boolean | No | false | Enhance insights with LLM |

**Response:**
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2023-01-01",
      "end_date": "2024-12-31"
    },
    "summary": {
      "total_income": 180000000,
      "total_expense": 150000000,
      "net_cashflow": 30000000,
      "transaction_count": 10000
    },
    "monthly_cashflow": [
      {
        "month": "2023-01",
        "income": 7500000,
        "expense": 6200000,
        "net": 1300000
      }
    ],
    "expense_by_category": [
      {
        "category": "food",
        "amount": 45000000,
        "percentage": 30,
        "transaction_count": 2500
      }
    ],
    "income_by_category": [
      {
        "category": "salary",
        "amount": 144000000,
        "percentage": 80,
        "transaction_count": 24
      }
    ],
    "trends": {
      "spending_trend": "increasing",
      "monthly_growth_rate": 2.5,
      "peak_spending_month": "2024-06",
      "lowest_spending_month": "2023-02"
    },
    "insights": [
      {
        "type": "warning",
        "title": "High Food Spending",
        "message": "Food expenses account for 30% of total spending",
        "deep_analysis": "In the analyzed period, food spending totaled Rp 45.000.000..."
      },
      {
        "type": "trend",
        "title": "Rising Transport Costs",
        "message": "Transport spending increased 15% over 3 months",
        "deep_analysis": "Data shows a consistent upward trend..."
      },
      {
        "type": "recommendation",
        "title": "Savings Opportunity",
        "message": "Reducing entertainment by 20% could save Rp 2.4M/month",
        "deep_analysis": "Entertainment and food are flexible categories..."
      }
    ]
  },
  "meta": {
    "generated_at": "2024-01-15T10:30:00Z",
    "llm_enhanced": false
  }
}
```

---

## 8. Configuration

### 8.1 Environment Variables
```env
# Required (for LLM features)
OPENROUTER_API_KEY=sk-or-...

# Optional (with defaults)
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
PORT=3000
```

### 8.2 Dependencies
```json
{
  "dependencies": {
    "hono": "^4.x",
    "zod": "^3.x",
    "date-fns": "^3.x",
    "ai": "^4.x",
    "@openrouter/ai-sdk-provider": "^0.x",
    "recharts": "^2.x",
    "react": "^18.x",
    "react-dom": "^18.x"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x"
  }
}
```

---

## 9. Sample API Responses

### 9.1 Basic Analysis Query
```bash
GET /api/v1/analysis?pocket_id=pocket_123&start_date=2024-12-01&end_date=2024-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { "start_date": "2024-12-01", "end_date": "2024-12-31" },
    "summary": {
      "total_income": 15000000,
      "total_expense": 8450000,
      "net_cashflow": 6550000,
      "transaction_count": 156
    },
    "expense_by_category": [
      { "category": "food", "amount": 2450000, "percentage": 29 },
      { "category": "transport", "amount": 1800000, "percentage": 21 },
      { "category": "utilities", "amount": 1500000, "percentage": 18 },
      { "category": "entertainment", "amount": 1200000, "percentage": 14 },
      { "category": "shopping", "amount": 1000000, "percentage": 12 },
      { "category": "other", "amount": 500000, "percentage": 6 }
    ],
    "insights": [
      {
        "type": "warning",
        "title": "High Food Spending",
        "message": "Food expenses account for 29% of total spending, above the recommended 20%",
        "deep_analysis": "Your food spending of Rp 2.450.000 is the largest expense category..."
      }
    ]
  }
}
```

### 9.2 With LLM Enhancement
```bash
GET /api/v1/analysis?pocket_id=pocket_123&include_llm=true
```

**Response includes enhanced `deep_analysis`** with natural language insights generated by the LLM.

### 9.3 Period Comparison
```bash
GET /api/v1/analysis?pocket_id=pocket_123&start_date=2024-01-01&end_date=2024-02-28
```

**Response includes trend analysis:**
```json
{
  "trends": {
    "spending_trend": "increasing",
    "monthly_growth_rate": 12.5,
    "peak_spending_month": "2024-02",
    "lowest_spending_month": "2024-01"
  },
  "insights": [
    {
      "type": "trend",
      "title": "Spending Increased",
      "message": "Total spending increased by 12.5% from January to February",
      "deep_analysis": "Your spending grew from Rp 7.200.000 in January to Rp 8.100.000 in February..."
    }
  ]
}
```

---

## 10. Success Criteria

### 10.1 Functional Requirements
- [x] API returns financial analysis with correct calculations
- [x] Date range filtering works correctly
- [x] Category breakdown shows accurate percentages
- [x] Insights are generated based on data patterns
- [x] Dashboard displays data with charts and cards

### 10.2 Non-Functional Requirements
- [x] Response time < 500ms for most queries (in-memory data)
- [x] Clean, mobile-responsive UI
- [x] Clear error messages for invalid queries
- [x] Works with or without LLM API key (graceful fallback)

### 10.3 Deliverables
1. Working codebase with TypeScript
2. React dashboard with charts
3. JSON API with analysis endpoint
4. This PRD as design documentation
5. README with setup instructions

---

## 11. Out of Scope (for MVP)

- User authentication/multi-user support
- Persistent conversation history (database)
- Transaction CRUD operations (add/edit/delete)
- Budget setting and tracking
- Notifications/alerts
- Export functionality (PDF, CSV)
- Multiple currency support

---

## 12. Timeline

This is a take-home test designed for **4-6 hours** of work.

### Implementation Order
1. **Project setup** - BHVR scaffold, dependencies, env config
2. **Shared types** - TypeScript interfaces for Transaction, Insight, etc.
3. **Data layer** - Load JSON, validate with Zod, query functions
4. **Analysis service** - Core calculations, statistics, trends
5. **Insights service** - Template-based + optional LLM enhancement
6. **API endpoints** - Hono routes with validation
7. **Frontend** - React dashboard with ShadCN/UI + Recharts
8. **Documentation** - README, code comments

---

## 13. Appendix

### 13.1 TypeScript Type Definitions
```typescript
// Transaction type
interface Transaction {
  id: number;
  wallet_id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  currency: string;
  transaction_date: string;
  created_at: string;
}

// Insight type
interface Insight {
  type: 'warning' | 'trend' | 'recommendation';
  title: string;
  message: string;
  deep_analysis: string;
}

// Analysis result
interface AnalysisResult {
  period: { start_date: string; end_date: string };
  summary: {
    total_income: number;
    total_expense: number;
    net_cashflow: number;
    transaction_count: number;
  };
  monthly_cashflow: MonthlyCashflow[];
  expense_by_category: CategoryBreakdown[];
  income_by_category: CategoryBreakdown[];
  trends: TrendAnalysis;
  insights: Insight[];
}
```

### 13.2 Vercel AI SDK Integration
```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function enhanceInsight(insight: Insight, context: string): Promise<string> {
  const { text } = await generateText({
    model: openrouter.chat('anthropic/claude-3.5-sonnet'),
    prompt: `You are a financial analyst. Enhance this insight with detailed analysis:
    
Title: ${insight.title}
Message: ${insight.message}
Context: ${context}

Provide a 2-3 sentence deep analysis that explains the significance and offers actionable advice.`,
  });
  
  return text;
}
```

### 13.3 System Prompt for LLM
```
You are a helpful personal finance assistant. You help users understand their 
spending patterns and make better financial decisions.

When analyzing financial data:
- Format currency as Indonesian Rupiah (Rp X.XXX.XXX)
- Provide percentages for context
- Be concise but informative
- Offer relevant insights and recommendations
- Use a professional but friendly tone

Focus on:
- Identifying spending patterns
- Highlighting areas of concern
- Suggesting actionable improvements
```
