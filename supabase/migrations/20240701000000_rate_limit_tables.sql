-- Create table for tracking per-minute rate limits
CREATE TABLE IF NOT EXISTS rate_limit_minute (
  user_id TEXT NOT NULL,
  minute TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  last_request_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (user_id, minute)
);

-- Create index on minute for cleanup jobs
CREATE INDEX IF NOT EXISTS idx_rate_limit_minute_minute ON rate_limit_minute (minute);

-- Create table for queue management
CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  queue_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_queue_user_id ON queue (user_id);

-- Create index on queue position for finding the next user in queue
CREATE INDEX IF NOT EXISTS idx_queue_position ON queue (queue_position) WHERE processed = FALSE;

-- Add user type column to users table if it doesn't exist already
-- This assumes a 'users' table exists, adjust if your table name is different
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'free'; 