// Read limits from environment variables
const anonymousLimitStr = process.env.LIMIT_ANONYMOUS;
const googleLimitStr = process.env.LIMIT_GOOGLE;
const freeLimitPerMinuteStr = process.env.FREE_LIMIT_PER_MINUTE || '5'; // Default to 5 if not set

if (!anonymousLimitStr || isNaN(parseInt(anonymousLimitStr, 10))) {
  throw new Error('Missing or invalid LIMIT_ANONYMOUS environment variable. Please set it in .env.local');
}

if (!googleLimitStr || isNaN(parseInt(googleLimitStr, 10))) {
  throw new Error('Missing or invalid LIMIT_GOOGLE environment variable. Please set it in .env.local');
}

// Parse and export the limits
export const summarizationLimits = {
  anonymous: parseInt(anonymousLimitStr, 10),
  google: parseInt(googleLimitStr, 10),
  freePerMinute: parseInt(freeLimitPerMinuteStr, 10),
}; 