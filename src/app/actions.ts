
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// --- User Profile Actions ---

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


// --- Support Actions ---

export async function getSupportStatus(supporterId: string, supportedId: string) {
    const supabase = createSupabaseServerClient();
    const { count } = await supabase
        .from('supports')
        .select('*', { count: 'exact', head: true })
        .eq('supporter_id', supporterId)
        .eq('supported_id', supportedId);

    return (count ?? 0) > 0;
}

export async function getSupporterCount(userId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('supports')
        .select('*', { count: 'exact', head: true })
        .eq('supported_id', userId);

    if (error) {
        console.error('Error getting supporter count:', error);
        return 0;
    }
    return count || 0;
}

export async function getSupportingCount(userId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('supports')
        .select('*', { count: 'exact', head: true })
        .eq('supporter_id', userId);
    
    if (error) {
        console.error('Error getting supporting count:', error);
        return 0;
    }
    return count || 0;
}

export async function supportUser(supportedId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated.");
    }
    if (user.id === supportedId) {
        throw new Error("Cannot support yourself.");
    }

    const { error } = await supabase
        .from('supports')
        .insert({ supporter_id: user.id, supported_id: supportedId });
    
    if (error) {
        console.error('Error supporting user:', error);
        throw error;
    }
    revalidatePath(`/gallery?userId=${supportedId}`);
    revalidatePath(`/gallery`);
}

export async function unsupportUser(supportedId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated.");
    }

    const { error } = await supabase
        .from('supports')
        .delete()
        .eq('supporter_id', user.id)
        .eq('supported_id', supportedId);

    if (error) {
        console.error('Error unsupporting user:', error);
        throw error;
    }
    revalidatePath(`/gallery?userId=${supportedId}`);
    revalidatePath(`/gallery`);
}
