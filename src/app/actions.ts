
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
