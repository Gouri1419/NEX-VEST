# NexVest - AI-Powered Startup Investment Platform

NexVest is a Multi-Agent System (MAS) platform that connects startup founders with investors using AI-driven analysis. Founders register their startups with real financial data and GitHub profiles, while investors get automated risk assessment, market analysis, and investment verdicts powered by multiple AI agents.

## Features

### For Startup Founders
- Register startup with financials (revenue projection, burn rate, runway, funding ask, equity offered)
- Link GitHub profile for automated Trust Score computation (0-100)
- Add LinkedIn profile for investor visibility
- AI agents automatically compute Idea Quality, Market Demand, Team Strength, and Competition Level

### For Investors
- Browse all registered startups
- One-click AI agent analysis on any startup
- **Risk Agent** — evaluates financial risk, market risk, and execution risk
- **Market Agent** — analyzes industry trends and market conditions
- **3 Investor Agents** (Conservative, Balanced, Aggressive) — each independently decides to fund or pass
- GitHub Trust Score with detailed breakdown (account age, repos, stars, followers, activity, tech stack)
- Final verdict: Strong Invest / Invest / Risky / Pass

### Authentication
- Email/password signup and login
- Role selection (Startup Founder or Investor)
- Session-based auth (expires on tab close)

### GitHub Trust Score
Fetches public GitHub data and computes a trust score based on:
- Account age (max 20 pts)
- Public repositories (max 20 pts)
- Total stars (max 20 pts)
- Followers (max 15 pts)
- Recent activity (max 15 pts)
- Tech diversity (max 10 pts)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| AI Agents | Custom multi-agent system (Risk, Market, Investor agents) |
| External APIs | GitHub REST API (public, no auth needed) |

## Project Structure

```
NEX-VEST/
├── backend/
│   ├── server.py              # Main FastAPI server with all endpoints
│   ├── agents/
│   │   ├── risk_agent.py      # Risk assessment agent
│   │   ├── market_agent.py    # Market analysis agent
│   │   └── investor_agent.py  # Investor decision agent
│   ├── simulation/
│   │   └── engine.py          # Simulation engine
│   ├── requirements.txt
│   └── supabase_setup.sql     # Database schema
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── AuthPage.js
│   │   │   ├── RoleSelectPage.js
│   │   │   ├── SimulationSetupPage.js   # Founder form + Investor view
│   │   │   ├── SimulationDashboard.js
│   │   │   └── AnalyticsPage.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   └── components/
│   │       └── DashboardLayout.js
│   ├── vercel.json
│   └── package.json
└── render.yaml
```

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Run the SQL in `supabase_setup.sql` in your Supabase Dashboard SQL Editor, then:

```bash
python server.py
```

Backend runs on `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

```bash
npm start
```

Frontend runs on `http://localhost:3000`

## Deployment

| Service | Platform |
|---------|----------|
| Backend | Render (Web Service) |
| Frontend | Vercel |
| Database | Supabase |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/role` | Set role (founder/investor) |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/startups/register` | Register a startup |
| GET | `/api/startups` | List all startups |
| GET | `/api/startups/{id}` | Get startup details |
| GET | `/api/startups/{id}/analyze` | Run AI agent analysis |
| GET | `/api/health` | Health check |

## How It Works

```
Founder signs up → Registers startup + GitHub username
                          ↓
         AI agents auto-score (Idea, Market, Team, Competition)
         GitHub API → Trust Score computed
                          ↓
              Startup visible to all investors
                          ↓
Investor clicks "Analyze" → Risk Agent + Market Agent + 3 Investor Agents
                          ↓
              Verdict: Strong Invest / Invest / Risky / Pass
```
