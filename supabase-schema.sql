-- Supabase SQL schema for DASH Diet app
-- Run this in your Supabase SQL Editor

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  answers JSONB NOT NULL,
  bmi DECIMAL(4,1),
  bmi_category TEXT,
  daily_calories INTEGER,
  plan JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table (synced via Stripe webhooks)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  email TEXT,
  status TEXT DEFAULT 'active',
  quiz_answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_email ON quiz_results(email);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created ON quiz_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Enable Row Level Security
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies: Allow insert from anon (for quiz submissions)
CREATE POLICY "Allow anonymous quiz submissions" ON quiz_results
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policies: Only service role can read quiz results
CREATE POLICY "Service role can read quiz results" ON quiz_results
  FOR SELECT TO service_role
  USING (true);

-- Policies: Only service role can manage subscriptions
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger for subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
