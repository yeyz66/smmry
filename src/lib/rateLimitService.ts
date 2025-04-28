import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RateLimitInfo, UserType } from '@/types/queue';
import { summarizationLimits } from '@/../config/limits';

/**
 * Service for handling rate limiting and queue management
 */
export class RateLimitService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }

  /**
   * Check if a user can make a summarization request
   * @param userId The user ID
   * @param userType The user type (free or premium)
   * @returns Information about rate limit status and queue position
   */
  async checkRateLimit(userId: string, userType: UserType): Promise<RateLimitInfo> {
    // Premium users don't have per-minute rate limits
    if (userType === UserType.PREMIUM) {
      return {
        currentRequests: 0,
        lastRequestAt: new Date().toISOString(),
        queuePosition: 0,
      };
    }

    // Get the current minute in UTC (truncate to the minute)
    const now = new Date();
    const currentMinute = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes()
      )
    ).toISOString();

    // Check current requests in this minute
    const { data, error } = await this.supabase
      .from('rate_limit_minute')
      .select('request_count, last_request_at')
      .eq('user_id', userId)
      .eq('minute', currentMinute)
      .single();

    let currentRequests = 0;
    let lastRequestAt = now.toISOString();

    if (error && error.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('Error checking rate limit:', error);
      throw new Error('Failed to check rate limit');
    }

    if (data) {
      currentRequests = data.request_count;
      lastRequestAt = data.last_request_at;
    }

    // Check if rate limit is exceeded
    if (currentRequests >= summarizationLimits.freePerMinute) {
      // User has exceeded rate limit, check queue position
      const queuePosition = await this.getOrCreateQueuePosition(userId);
      return {
        currentRequests,
        lastRequestAt,
        queuePosition,
      };
    }

    // User hasn't exceeded rate limit
    return {
      currentRequests,
      lastRequestAt,
      queuePosition: 0,
    };
  }

  /**
   * Increment the request count for a user in the current minute
   * @param userId The user ID
   * @returns The updated request count
   */
  async incrementRequestCount(userId: string): Promise<number> {
    // Get the current minute in UTC
    const now = new Date();
    const currentMinute = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes()
      )
    ).toISOString();

    // Upsert to rate_limit_minute table
    const { data, error } = await this.supabase.rpc('increment_rate_limit', {
      p_user_id: userId,
      p_minute: currentMinute,
      p_last_request_at: now.toISOString(),
    });

    if (error) {
      console.error('Error incrementing request count:', error);
      throw new Error('Failed to update rate limit count');
    }

    return data || 1;
  }

  /**
   * Get a user's queue position or create a new queue entry
   * @param userId The user ID
   * @returns The queue position
   */
  private async getOrCreateQueuePosition(userId: string): Promise<number> {
    // Check if user is already in queue
    const { data: existingEntry } = await this.supabase
      .from('queue')
      .select('queue_position, processed')
      .eq('user_id', userId)
      .eq('processed', false)
      .single();

    if (existingEntry) {
      return existingEntry.queue_position;
    }

    // Get the highest queue position
    const { data: highestQueue } = await this.supabase
      .from('queue')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = highestQueue ? highestQueue.queue_position + 1 : 1;

    // Add user to queue
    const { error: insertError } = await this.supabase
      .from('queue')
      .insert({
        user_id: userId,
        queue_position: nextPosition,
        processed: false,
      });

    if (insertError) {
      console.error('Error adding user to queue:', insertError);
      throw new Error('Failed to add user to queue');
    }

    return nextPosition;
  }

  /**
   * Check if a user is next in queue and can proceed
   * @param userId The user ID
   * @returns Whether the user can proceed
   */
  async canProceedFromQueue(userId: string): Promise<boolean> {
    // Get the lowest queue position that hasn't been processed
    const { data: nextInQueue, error } = await this.supabase
      .from('queue')
      .select('user_id, queue_position')
      .eq('processed', false)
      .order('queue_position', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      console.error('Error checking queue position:', error);
      return false;
    }

    // Check if this user is next in queue
    if (nextInQueue && nextInQueue.user_id === userId) {
      // Mark as processed
      await this.supabase
        .from('queue')
        .update({ processed: true })
        .eq('user_id', userId)
        .eq('processed', false);
      
      return true;
    }

    return false;
  }
} 