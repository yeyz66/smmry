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