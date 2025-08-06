
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

export async function getSubscriptionStatus(supporterId: string, supportedId: string) {
    const supabase = createSupabaseServerClient();
    const { data, error, count } = await supabase
        .from('supports')
        .select('*', { count: 'exact', head: true })
        .eq('supporter_id', supporterId)
        .eq('supported_id', supportedId);

    if (error) {
        console.error('Error getting subscription status:', error);
        return false;
    }
    return (count ?? 0) > 0;
}

export async function getSubscriberCount(userId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('supports')
        .select('*', { count: 'exact', head: true })
        .eq('supported_id', userId);

    if (error) {
        console.error('Error getting subscriber count:', error);
        return 0;
    }
    return count || 0;
}

export async function getSubscribedCount(userId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('supports')
        .select('*', { count: 'exact', head: true })
        .eq('supporter_id', userId);
    
    if (error) {
        console.error('Error getting subscribed count:', error);
        return 0;
    }
    return count || 0;
}

export async function subscribeUser(supporterId: string, supportedId: string) {
    if (supporterId === supportedId) {
        throw new Error("Cannot support yourself.");
    }
    // RLS is now handled by policies in Supabase, so we can use the standard server client.
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
        .from('supports')
        .insert({ supporter_id: supporterId, supported_id: supportedId });
    
    if (error) {
        console.error('Error supporting user:', error);
        throw error;
    }
    revalidatePath(`/gallery?userId=${supportedId}`);
    revalidatePath(`/gallery?userId=${supporterId}`);
    revalidatePath('/gallery');
}

export async function unsubscribeUser(supporterId: string, supportedId: string) {
    // RLS is now handled by policies in Supabase, so we can use the standard server client.
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
        .from('supports')
        .delete()
        .eq('supporter_id', supporterId)
        .eq('supported_id', supportedId);

    if (error) {
        console.error('Error unsupporting user:', error);
        throw error;
    }
    revalidatePath(`/gallery?userId=${supportedId}`);
    revalidatePath(`/gallery?userId=${supporterId}`);
    revalidatePath('/gallery');
}
