# Rate Limiting and Queue System for Free Users

This document explains how the rate limiting and queue system works for free users of the summarization functionality.

## Overview

Free users have the following limitations:
1. Daily limit on the number of summarization requests (configured via `LIMIT_GOOGLE` environment variable)
2. Per-minute limit across all free users (configured via `FREE_LIMIT_PER_MINUTE` environment variable)

When the per-minute limit is reached, users are automatically placed in a queue and must wait their turn.

## Setup Instructions

### 1. Environment Configuration

Add the following to your `.env.local` file:

```
# Rate Limits
LIMIT_ANONYMOUS=3 # Daily limit for anonymous users
LIMIT_GOOGLE=10 # Daily limit for logged-in users
FREE_LIMIT_PER_MINUTE=5 # Per-minute limit for free users
```

### 2. Database Tables

Run the following SQL migrations in your Supabase project:

```sql
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

-- Add user type column to users table
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'free';
```

### 3. Database Function

Create the following SQL function in your Supabase project:

```sql
-- Create function to atomically increment the rate limit counter
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_user_id TEXT,
  p_minute TIMESTAMPTZ,
  p_last_request_at TIMESTAMPTZ
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Insert if not exists, otherwise update
  INSERT INTO rate_limit_minute (user_id, minute, request_count, last_request_at)
  VALUES (p_user_id, p_minute, 1, p_last_request_at)
  ON CONFLICT (user_id, minute) 
  DO UPDATE SET 
    request_count = rate_limit_minute.request_count + 1,
    last_request_at = p_last_request_at
  RETURNING request_count INTO v_count;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;
```

## How It Works

1. When a user makes a summarization request, the system first checks if they are a free or premium user.
2. For free users, it checks if the current per-minute request count has reached the limit.
3. If the limit is reached, the user is placed in a queue with a position number.
4. The frontend shows a queue status component with the user's position.
5. The frontend automatically polls the API to check if the user has reached the front of the queue.
6. When the user reaches the front of the queue, their request is processed automatically.

## User Flow

Free users will experience the following flow:

1. User submits a text for summarization.
2. If the per-minute limit isn't reached, the request is processed immediately.
3. If the limit is reached, the user sees a message: "Rate limit exceeded. You're in queue position X."
4. The UI shows a progress indicator and queue position.
5. When the user reaches the front of the queue, the request is automatically processed.

## Maintenance

Consider implementing a scheduled job to clean up old rate limit entries and processed queue entries to keep the database size manageable.

Example cleanup SQL (can be run as a scheduled function):

```sql
-- Delete rate limit entries older than 1 day
DELETE FROM rate_limit_minute WHERE minute < NOW() - INTERVAL '1 day';

-- Delete processed queue entries older than 1 day
DELETE FROM queue WHERE processed = true AND created_at < NOW() - INTERVAL '1 day';
``` 