-- Safe migration: Add personalized_plan column if not exists
-- WARNING: Never use DROP TABLE in production!

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS personalized_plan JSONB;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_session_id
  ON subscriptions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email
  ON subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON subscriptions(status);

-- Add comments
COMMENT ON TABLE subscriptions IS 'Stores subscription data and personalized DASH diet plans';
COMMENT ON COLUMN subscriptions.personalized_plan IS 'Complete personalized DASH diet plan including meals, exercises, shopping lists, and progress tracking';
