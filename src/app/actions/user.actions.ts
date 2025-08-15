'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// --- User Profile Actions ---

export async function updateUserProfile(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const name = formData.get('name') as string;
    const is_private = formData.get('is_private') === 'true';
    const avatarFile = formData.get('avatar') as File;

    const profileData: { name: string; is_private: boolean; picture?: string } = {
        name,
        is_private,
    };

    // Handle avatar upload if a new file is provided
    if (avatarFile && avatarFile.size > 0) {
        // Use the user's client to respect RLS policies for storage.
        const supabaseAsUser = createSupabaseServerClient(false);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabaseAsUser.storage
            .from('avatars')
            .upload(filePath, avatarFile, {
                upsert: true,
                cacheControl: '3600',
            });

        if (uploadError) {
            console.error('Avatar upload error:', uploadError);
            throw new Error('Failed to upload new avatar.');
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        profileData.picture = publicUrl;
    }

    // Update user's profile in the users table
    const { error: updateError } = await supabase
        .from('users')
        .update(profileData)
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw new Error('Failed to update profile.');
    }
    
    revalidatePath('/gallery');
    revalidatePath('/profile/edit');
}


export async function deleteUserAccount() {
    const supabase = createSupabaseServerClient(); // Does not bypass RLS
    const { error } = await supabase.rpc('handle_delete_user');
    if (error) {
        console.error('Error scheduling user deletion:', error);
        throw error;
    }
}

export async function searchUsers(query: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!query.trim()) {
        return [];
    }
    
    let queryBuilder = supabase
        .from('users')
        .select('id, name, picture, is_private')
        .ilike('name', `${query}%`);
        
    const { data, error } = await queryBuilder.limit(10);

    if (error) {
        console.error("Failed to search users", error);
        throw error;
    }
    
    return data || [];
}