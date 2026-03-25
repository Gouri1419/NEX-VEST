-- Run this in Supabase Dashboard > SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Startups table
CREATE TABLE IF NOT EXISTS startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT DEFAULT 'tech',
    idea_quality INTEGER,
    market_demand INTEGER,
    team_strength INTEGER,
    revenue_projection FLOAT,
    burn_rate FLOAT,
    runway_months INTEGER,
    funding_ask FLOAT,
    equity_offered FLOAT,
    competition_level TEXT,
    description TEXT,
    founder_name TEXT,
    founder_email TEXT,
    github_username TEXT,
    linkedin_url TEXT,
    github_data JSONB,
    trust_score INTEGER DEFAULT 0,
    trust_reasons JSONB,
    status TEXT DEFAULT 'seeking_funding',
    funding_received FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security but allow all access via anon key (for now)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on startups" ON startups FOR ALL USING (true) WITH CHECK (true);
