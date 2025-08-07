
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

export async function updateUserProfile({ name, avatarFile }: { name: string; avatarFile?: File }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated.");
    }

    let avatarUrl = undefined;
    
    // Create a client that can bypass RLS to upload the avatar
    const supabaseAdmin = createSupabaseServerClient(true);

    if (avatarFile && avatarFile.size > 0) {
        const filePath = `${user.id}/avatar.${avatarFile.name.split('.').pop()}`;
        
        const { error: uploadError } = await supabaseAdmin.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
                upsert: true, // Overwrite existing file
            });

        if (uploadError) {
            console.error('Avatar upload error:', uploadError);
            throw new Error('Failed to upload new profile picture.');
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        // Add a timestamp to bust the cache
        avatarUrl = `${publicUrl}?t=${new Date().getTime()}`;
    }

    const updates: { name: string; picture?: string } = { name };
    if (avatarUrl) {
        updates.picture = avatarUrl;
    }
    
    // 1. Update the public users table
    const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw new Error('Failed to update profile.');
    }

    // 2. Update the user_metadata in the auth schema
    const { error: adminUserUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { user_metadata: updates }
    );
    
    if (adminUserUpdateError) {
        console.error('Error updating auth user metadata:', adminUserUpdateError);
        // This is not a critical error for the user, so we can just log it
    }


    // Revalidate paths to reflect changes immediately
    revalidatePath('/gallery');
    revalidatePath(`/gallery?userId=${user.id}`);
    revalidatePath('/profile/edit');
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

export async function getSupporters(userId: string): Promise<{ id: string; name: string; picture: string; }[]> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('supports')
        .select('supporter:users!supports_supporter_id_fkey(id, name, picture)')
        .eq('supported_id', userId);

    if (error) {
        console.error('Error getting supporters:', error);
        return [];
    }
    // The data is nested, so we need to flatten it.
    return data.map(s => s.supporter) as { id: string; name: string; picture: string; }[];
}

export async function getSupporting(userId: string): Promise<{ id: string; name: string; picture: string; }[]> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('supports')
        .select('supported:users!supports_supported_id_fkey(id, name, picture)')
        .eq('supporter_id', userId);

    if (error) {
        console.error('Error getting supporting list:', error);
        return [];
    }
    // The data is nested, so we need to flatten it.
    return data.map(s => s.supported) as { id: string; name: string; picture: string; }[];
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

    // Create notification
    await createNotification({
        recipient_id: supportedId,
        actor_id: user.id,
        type: 'new_supporter',
    });

    revalidatePath(`/gallery?userId=${supportedId}`);
    revalidatePath(`/gallery`);
    revalidatePath(`/mood`); // Revalidate mood page to show new posts
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
    revalidatePath(`/mood`); // Revalidate mood page to hide posts
}

// --- Mood Actions ---

export async function setMood(emojiId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated.");
    }

    const { error } = await supabase
        .from('moods')
        .upsert(
            { user_id: user.id, emoji_id: emojiId, created_at: new Date().toISOString() },
            { onConflict: 'user_id' }
        );

    if (error) {
        console.error('Error setting mood:', error);
        throw new Error(error.message);
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

    if (!user) return; // Don't record views for non-users

    // Don't record viewing your own mood
    const { data: mood, error: moodError } = await supabase
        .from('moods')
        .select('user_id')
        .eq('id', moodId)
        .single();
    
    if (moodError || !mood || mood.user_id === user.id) {
        return;
    }

    const { error } = await supabase
        .from('mood_views')
        .insert({ mood_id: moodId, viewer_id: user.id });

    if (error && error.code !== '23505') { // 23505 is unique violation, ignore it
        console.error('Error recording mood view:', error);
    }
}

export async function getMoodViewers(moodId: number): Promise<{ id: string; name: string; picture: string; }[]> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('mood_views')
        .select('user:users!inner(id, name, picture)')
        .eq('mood_id', moodId)
        .order('viewed_at', { ascending: false });

    if (error) {
        console.error('Error getting mood viewers:', error);
        return [];
    }
    
    // The data is nested, so we need to flatten it.
    return data.map(v => v.user) as { id: string; name: string; picture: string; }[];
}

// --- Like Actions ---

export async function likePost(emojiId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    // First, find the owner of the post
    const { data: emoji, error: emojiError } = await supabase
        .from('emojis')
        .select('user_id')
        .eq('id', emojiId)
        .single();
    
    if (emojiError) {
        console.error('Error finding post owner:', emojiError);
        throw emojiError;
    }

    const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, emoji_id: emojiId });

    if (error) {
        if (error.code === '23505') { // Ignore unique constraint violation
            return;
        }
        console.error('Error liking post:', error);
        throw error;
    }
    
    // Create notification if not liking your own post
    if (user.id !== emoji.user_id) {
        await createNotification({
            recipient_id: emoji.user_id,
            actor_id: user.id,
            type: 'new_like',
            emoji_id: emojiId
        });
    }

    revalidatePath('/mood');
    revalidatePath('/explore');
    revalidatePath('/gallery');
}

export async function unlikePost(emojiId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('emoji_id', emojiId);
    
    if (error) {
        console.error('Error unliking post:', error);
        throw error;
    }
    revalidatePath('/mood');
    revalidatePath('/explore');
    revalidatePath('/gallery');
}

export async function getLikeCount(emojiId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('emoji_id', emojiId);
    
    if (error) {
        console.error('Error getting like count:', error);
        return 0;
    }
    return count || 0;
}

export async function getIsLiked(emojiId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('emoji_id', emojiId);

    return (count ?? 0) > 0;
}


// --- Notification Actions ---
type NotificationPayload = {
    recipient_id: string;
    actor_id: string;
    type: 'new_supporter' | 'new_like';
    emoji_id?: string;
}

export async function createNotification(payload: NotificationPayload) {
    const supabase = createSupabaseServerClient(true); // Use admin client to insert
    const { error } = await supabase.from('notifications').insert(payload);
    if (error) {
        console.error('Error creating notification:', error);
    }
}

export async function getNotifications() {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('notifications')
        .select(`
            id,
            type,
            created_at,
            emoji_id,
            actor:users!notifications_actor_id_fkey (id, name, picture),
            emoji:emojis (id, background_color, emoji_color, expression, model, shape, eye_style, mouth_style, eyebrow_style, show_sunglasses, show_mustache, feature_offset_x, feature_offset_y, selected_filter)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
    return data;
}
