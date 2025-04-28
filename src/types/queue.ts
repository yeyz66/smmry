/**
 * Types for rate limiting and queue system
 */

export interface RateLimitInfo {
  // Number of requests in the current minute
  currentRequests: number;
  // Timestamp of the last request
  lastRequestAt: string;
  // Queue position if rate limit is reached (0 means no queue)
  queuePosition: number;
}

export interface QueueEntry {
  id: string;
  user_id: string;
  queue_position: number;
  created_at: string;
  processed: boolean;
}

export enum UserType {
  FREE = 'free',
  PREMIUM = 'premium'
} 