# Environment Variables Configuration

Copy this template to `.env.local` in the root of your project and fill in your actual values.

```
# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# DeepSeek API
DEEPSEEK_API_KEY=your-deepseek-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL_NAME=deepseek-chat

# Rate Limits
LIMIT_ANONYMOUS=3 # Daily limit for anonymous users
LIMIT_GOOGLE=10 # Daily limit for logged-in users
FREE_LIMIT_PER_MINUTE=5 # Per-minute limit for free users

# Word Limits
NEXT_PUBLIC_INPUT_WORD_LIMIT=10000
```

## Rate Limiting Configuration

The application implements several rate limiting mechanisms:

1. **Daily Limits**:
   - `LIMIT_ANONYMOUS`: Maximum number of summaries per day for anonymous users
   - `LIMIT_GOOGLE`: Maximum number of summaries per day for logged-in users

2. **Per-Minute Limits**:
   - `FREE_LIMIT_PER_MINUTE`: Maximum number of summaries per minute for all free users combined

When the per-minute limit is reached, users are placed in a queue and will be processed in order as capacity becomes available.

## Database Setup

To support rate limiting and queueing, run the migrations found in the `supabase/migrations` directory to create the necessary tables and functions:

1. `rate_limit_minute`: Tracks per-minute usage
2. `queue`: Manages the queue of users waiting to make requests
3. A new `user_type` column in the `users` table to differentiate free and premium users 