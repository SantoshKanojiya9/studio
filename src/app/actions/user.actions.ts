
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { updateUserInCache } from '@/lib/post-cache';

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
        const supabaseAsUser = createSupabaseServerClient(false);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar.${fileExt}`;
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
        
        // Add a timestamp to the URL to bypass browser cache
        profileData.picture = `${publicUrl}?t=${new Date().getTime()}`;
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
    
    // Also update the user cache to reflect changes immediately on the client
    if (profileData.picture) {
        updateUserInCache(user.id, { name: profileData.name, picture: profileData.picture });
    } else {
        updateUserInCache(user.id, { name: profileData.name });
    }

    revalidatePath('/gallery');
    revalidatePath('/profile/edit');
}

export async function removeUserProfilePicture() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");

    const defaultPicture = `https://placehold.co/64x64.png?text=${(user.email || 'U').charAt(0).toUpperCase()}`;

    // Update the user's profile to the default picture
    const { error: updateError } = await supabase
        .from('users')
        .update({ picture: defaultPicture })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error removing profile picture:', updateError);
        throw new Error('Failed to remove profile picture.');
    }
    
    // Attempt to remove the old avatar file, but don't block if it fails
    // This is a best-effort cleanup.
    const { data: files, error: listError } = await supabase.storage.from('avatars').list(user.id);
    if (!listError && files && files.length > 0) {
        const fileToRemove = files.find(f => f.name.startsWith('avatar.'));
        if (fileToRemove) {
            await supabase.storage.from('avatars').remove([`${user.id}/${fileToRemove.name}`]);
        }
    }

    // Update cache and revalidate paths
    updateUserInCache(user.id, { picture: defaultPicture });
    revalidatePath('/gallery');
    revalidatePath('/profile/edit');

    return { newPicture: defaultPicture };
}


export async function deleteUserAccount() {
    const supabase = createSupabaseServerClient();
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
