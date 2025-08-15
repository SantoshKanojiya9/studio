'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { UserWithSupportStatus } from './support.actions';

// --- Mood Actions ---

export async function setMood(emojiId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated.");
    }

    // Step 1: Delete any existing mood for the user.
    // This ensures a new mood_id is created, resetting views.
    const { error: deleteError } = await supabase
        .from('moods')
        .delete()
        .eq('user_id', user.id);
        
    if (deleteError) {
        console.error('Error deleting old mood:', deleteError);
        throw deleteError;
    }

    // Step 2: Insert the new mood.
    const { error: insertError } = await supabase
        .from('moods')
        .insert({ 
            user_id: user.id, 
            emoji_id: emojiId, 
            created_at: new Date().toISOString() 
        });

    if (insertError) {
        console.error('Error setting new mood:', insertError);
        throw new Error(insertError.message);
    }

    revalidatePath('/mood');
}

export async function removeMood() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated.");
    }

    const { error } = await supabase
        .from('moods')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        console.error('Error removing mood:', error);
        throw new Error(error.message);
    }

    revalidatePath('/mood');
}

export async function recordMoodView(moodId: number) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return; // Don't record views for non-logged-in users
    }

    // Allow users to record a view for their own mood.
    const { error } = await supabase
        .from('mood_views')
        .insert({ mood_id: moodId, viewer_id: user.id });

    // Ignore unique violation errors (code 23505), as it just means the user has already viewed this mood.
    if (error && error.code !== '23505') {
        console.error('Error recording mood view:', error);
    }
}

export async function getMoodViewers(moodId: number): Promise<UserWithSupportStatus[]> {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return [];
    
    const { data, error } = await supabase
        .rpc('get_mood_viewers', { p_mood_id: moodId, p_current_user_id: currentUser.id });

    if (error) {
        console.error('Error getting mood viewers:', error);
        return [];
    }
    
    return (data || []) as UserWithSupportStatus[];
}