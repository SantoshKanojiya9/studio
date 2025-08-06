
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// --- User Profile Actions ---

export async function getUserProfile(userId: string) {
    // This client does NOT bypass RLS.
    // It can only fetch the profile if RLS policies allow it.
    const supabase = createSupabaseServerClient(); 
    const { data, error } = await supabase
        .from('users')
        .select('id, name, picture, deleted_at')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
    return data;
}

export async function deleteUserAccount() {
    const supabase = createSupabaseServerClient(); // Does not bypass RLS
    const { error } = await supabase.rpc('handle_delete_user');
    if (error) {
        console.error('Error scheduling user deletion:', error);
        throw error;
    }
}

export async function recoverUserAccount() {
    const supabase = createSupabaseServerClient(); // Does not bypass RLS
    const { error } = await supabase.rpc('handle_recover_user');
     if (error) {
        console.error('Error recovering user account:', error);
        throw error;
    }
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
