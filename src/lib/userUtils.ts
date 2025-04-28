import { SupabaseClient } from '@supabase/supabase-js';
import { UserType } from '@/types/queue';

/**
 * Get the user type (free or premium)
 * @param supabase Supabase client
 * @param userId User ID
 * @returns User type (free or premium)
 */
export async function getUserType(
  supabase: SupabaseClient,
  userId: string
): Promise<UserType> {
  // Fetch user data from database
  const { data, error } = await supabase
    .from('users')
    .select('user_type')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user type:', error);
    // Default to free if there's an error
    return UserType.FREE;
  }

  // If user_type is 'premium', return premium
  if (data?.user_type === 'premium') {
    return UserType.PREMIUM;
  }

  // Default to free
  return UserType.FREE;
} 