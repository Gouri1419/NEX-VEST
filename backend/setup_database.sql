-- AI Startup Ecosystem Simulator - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USER PROFILES ====================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SIMULATIONS ====================
CREATE TABLE simulations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  num_startups INT DEFAULT 5,
  num_investors INT DEFAULT 3,
  num_rounds INT DEFAULT 5,
  market_condition TEXT DEFAULT 'neutral' CHECK (market_condition IN ('bull', 'bear', 'neutral', 'volatile')),
  industry TEXT DEFAULT 'tech',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SIMULATED STARTUPS ====================
CREATE TABLE sim_startups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID REFERENCES simulations ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  idea_quality NUMERIC(5,2) DEFAULT 50 CHECK (idea_quality >= 0 AND idea_quality <= 100),
  team_strength NUMERIC(5,2) DEFAULT 50 CHECK (team_strength >= 0 AND team_strength <= 100),
  market_demand NUMERIC(5,2) DEFAULT 50 CHECK (market_demand >= 0 AND market_demand <= 100),
  revenue_projection NUMERIC(12,2) DEFAULT 0,
  burn_rate NUMERIC(12,2) DEFAULT 0,
  funding_received NUMERIC(12,2) DEFAULT 0,
  runway_months NUMERIC(5,1) DEFAULT 12,
  success_probability NUMERIC(5,2) DEFAULT 50,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'funded', 'failed', 'acquired', 'unicorn')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SIMULATED INVESTORS ====================
CREATE TABLE sim_investors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID REFERENCES simulations ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  investor_type TEXT DEFAULT 'vc' CHECK (investor_type IN ('angel', 'vc', 'pe', 'accelerator')),
  risk_tolerance NUMERIC(5,2) DEFAULT 50 CHECK (risk_tolerance >= 0 AND risk_tolerance <= 100),
  budget NUMERIC(14,2) NOT NULL,
  remaining_budget NUMERIC(14,2),
  strategy TEXT DEFAULT 'balanced' CHECK (strategy IN ('aggressive', 'conservative', 'balanced', 'contrarian')),
  preferred_industry TEXT,
  total_invested NUMERIC(14,2) DEFAULT 0,
  total_returns NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== FUNDING ROUNDS ====================
CREATE TABLE sim_funding_rounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID REFERENCES simulations ON DELETE CASCADE NOT NULL,
  round_number INT NOT NULL,
  startup_id UUID REFERENCES sim_startups ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES sim_investors ON DELETE CASCADE,
  amount NUMERIC(14,2),
  equity_percentage NUMERIC(5,2),
  risk_score NUMERIC(5,2),
  market_score NUMERIC(5,2),
  decision TEXT NOT NULL CHECK (decision IN ('funded', 'rejected', 'pending')),
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== MARKET EVENTS ====================
CREATE TABLE sim_market_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID REFERENCES simulations ON DELETE CASCADE NOT NULL,
  round_number INT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('boom', 'crash', 'regulation', 'innovation', 'competition', 'stable')),
  description TEXT,
  impact_score NUMERIC(5,2),
  affected_industries TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== AGENT ACTION LOGS ====================
CREATE TABLE agent_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID REFERENCES simulations ON DELETE CASCADE NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('startup', 'investor', 'risk', 'market')),
  agent_id UUID,
  round_number INT,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SIMULATION SNAPSHOTS (per round) ====================
CREATE TABLE sim_round_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  simulation_id UUID REFERENCES simulations ON DELETE CASCADE NOT NULL,
  round_number INT NOT NULL,
  total_funding_deployed NUMERIC(14,2) DEFAULT 0,
  active_startups INT DEFAULT 0,
  failed_startups INT DEFAULT 0,
  avg_success_probability NUMERIC(5,2),
  market_sentiment NUMERIC(5,2),
  snapshot_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ROW LEVEL SECURITY ====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_funding_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own simulations" ON simulations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create simulations" ON simulations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own simulations" ON simulations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own simulations" ON simulations FOR DELETE USING (auth.uid() = user_id);
