
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper function to create a Supabase client for server actions
function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// --- User Profile Actions ---

export async function getUserProfile(userId: string) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('users')
        .select('id, name, picture')
        .eq('id', userId)
        .single();
    if (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
    return data;
}

// --- Subscription Actions ---

export async function getSubscriptionStatus(subscriberId: string, subscribedToId: string) {
    const supabase = createSupabaseServerClient();
    const { data, error, count } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('subscriber_id', subscriberId)
        .eq('subscribed_to_id', subscribedToId);

    if (error) {
        console.error('Error getting subscription status:', error);
        return false;
    }
    return (count ?? 0) > 0;
}

export async function getFollowerCount(userId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('subscribed_to_id', userId);

    if (error) {
        console.error('Error getting follower count:', error);
        return 0;
    }
    return count || 0;
}

export async function getFollowingCount(userId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('subscriber_id', userId);
    
    if (error) {
        console.error('Error getting following count:', error);
        return 0;
    }
    return count || 0;
}

export async function subscribeUser(subscriberId: string, subscribedToId: string) {
    if (subscriberId === subscribedToId) {
        throw new Error("Cannot subscribe to yourself.");
    }
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
        .from('subscriptions')
        .insert({ subscriber_id: subscriberId, subscribed_to_id: subscribedToId });
    
    if (error) {
        console.error('Error subscribing:', error);
        throw error;
    }
    revalidatePath(`/gallery?userId=${subscribedToId}`);
}

export async function unsubscribeUser(subscriberId: string, subscribedToId: string) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('subscriber_id', subscriberId)
        .eq('subscribed_to_id', subscribedToId);

    if (error) {
        console.error('Error unsubscribing:', error);
        throw error;
    }
    revalidatePath(`/gallery?userId=${subscribedToId}`);
}
