-- TESTING MIGRATION - Drop and recreate subscriptions table
-- Safe to run since we're still in testing phase

DROP TABLE IF EXISTS subscriptions CASCADE;

CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  quiz_answers JSONB,
  personalized_plan JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX idx_subscriptions_stripe_session_id ON subscriptions(stripe_session_id);
CREATE INDEX idx_subscriptions_email ON subscriptions(email);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Add comments
COMMENT ON TABLE subscriptions IS 'Stores subscription data and personalized DASH diet plans';
COMMENT ON COLUMN subscriptions.personalized_plan IS 'Complete personalized DASH diet plan including meals, exercises, shopping lists, and progress tracking';

-- Enable Row Level Security (optional, adjust based on your needs)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything
CREATE POLICY "Service role has full access" ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
