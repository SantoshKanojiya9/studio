
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { EmojiState } from '@/app/design/page';

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
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);

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
    
    // Also update the user's metadata in auth.users for consistency
    await supabase.auth.updateUser({
        data: {
            name: profileData.name,
            ...(profileData.picture && { picture: profileData.picture }),
        }
    });

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
    const { data, error } = await supabase
        .from('supports')
        .select('status')
        .eq('supporter_id', supporterId)
        .eq('supported_id', supportedId)
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') return null; // No relationship found
        console.error("Error getting support status:", error);
        return null;
    }

    return data?.status || null; // 'approved', 'pending', or null
}

export async function getSupporterCount(userId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('supports')
        .select('*', { count: 'exact', head: true })
        .eq('supported_id', userId)
        .eq('status', 'approved');

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
        .eq('supporter_id', userId)
        .eq('status', 'approved');
    
    if (error) {
        console.error('Error getting supporting count:', error);
        return 0;
    }
    return count || 0;
}

type UserWithSupportStatus = { id: string; name: string; picture: string; is_private: boolean; support_status: 'approved' | 'pending' | null; has_mood: boolean; };

export async function getSupporters({ userId, page = 1, limit = 15 }: { userId: string, page: number, limit: number }): Promise<UserWithSupportStatus[]> {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const offset = (page - 1) * limit;

    const { data, error } = await supabase
        .rpc('get_supporters_with_status', {
            p_user_id: userId,
            p_current_user_id: currentUser?.id,
            p_limit: limit,
            p_offset: offset
        });

    if (error) {
        console.error('Error getting supporters:', error);
        return [];
    }
    return data as UserWithSupportStatus[];
}

export async function getSupporting({ userId, page = 1, limit = 15 }: { userId: string, page: number, limit: number }): Promise<UserWithSupportStatus[]> {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const offset = (page - 1) * limit;

    const { data, error } = await supabase
        .rpc('get_supporting_with_status', {
            p_user_id: userId,
            p_current_user_id: currentUser?.id,
            p_limit: limit,
            p_offset: offset
        });

    if (error) {
        console.error('Error getting supporting list:', error);
        return [];
    }
    return data as UserWithSupportStatus[];
}


export async function supportUser(supportedId: string, isPrivate: boolean) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User not authenticated.");
    }
    if (user.id === supportedId) {
        throw new Error("Cannot support yourself.");
    }
    
    const status = isPrivate ? 'pending' : 'approved';

    const { error } = await supabase
        .from('supports')
        .insert({ supporter_id: user.id, supported_id: supportedId, status });
    
    if (error) {
        console.error('Error supporting user:', error);
        throw error;
    }

    // Create notification if the user accepted the follow request
    if (status === 'approved') {
        await createNotification({
            recipient_id: supportedId,
            actor_id: user.id,
            type: 'new_supporter',
        });
    } else { // It's a private account, so send a request notification
        await createNotification({
            recipient_id: supportedId,
            actor_id: user.id,
            type: 'new_support_request',
        });
    }

    revalidatePath(`/gallery?userId=${supportedId}`);
    revalidatePath(`/notifications`);
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
    revalidatePath(`/notifications`);
}

export async function respondToSupportRequest(supporterId: string, action: 'approve' | 'decline') {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    if (action === 'approve') {
        const { error } = await supabase
            .from('supports')
            .update({ status: 'approved' })
            .eq('supporter_id', supporterId)
            .eq('supported_id', user.id)
            .eq('status', 'pending');

        if (error) throw error;
        
        // Notify the user that their request was approved
        await createNotification({
            recipient_id: supporterId,
            actor_id: user.id,
            type: 'support_request_approved'
        });

    } else { // decline
        const { error } = await supabase
            .from('supports')
            .delete()
            .eq('supporter_id', supporterId)
            .eq('supported_id', user.id)
            .eq('status', 'pending');
        
        if (error) throw error;
    }
    
    revalidatePath('/notifications');
}

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

export async function getMoodViewers(moodId: number): Promise<{ id: string; name: string; picture: string; }[]> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .rpc('get_mood_viewers', { p_mood_id: moodId });

    if (error) {
        console.error('Error getting mood viewers:', error);
        return [];
    }
    
    return data as { id: string; name: string; picture: string; }[];
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

export async function getLikers({ emojiId, page = 1, limit = 15 }: { emojiId: string, page: number, limit: number }): Promise<UserWithSupportStatus[]> {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
        .rpc('get_paginated_likers', {
            p_emoji_id: emojiId,
            p_current_user_id: currentUser?.id,
            p_limit: limit,
            p_offset: offset
        });

    if (error) {
        console.error('Error getting likers:', error);
        return [];
    }

    return data as UserWithSupportStatus[];
}


// --- Notification Actions ---
type NotificationPayload = {
    recipient_id: string;
    actor_id: string;
    type: 'new_supporter' | 'new_like' | 'new_support_request' | 'support_request_approved';
    emoji_id?: string;
}

export async function createNotification(payload: NotificationPayload) {
    const supabase = createSupabaseServerClient(); // Use non-admin client to trigger realtime
    const { error } = await supabase.from('notifications').insert(payload);
    if (error) {
        console.error('Error creating notification:', error);
    }
}

export async function getNotifications({ page = 1, limit = 15 }: { page: number, limit: number }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const offset = (page - 1) * limit;

    const { data, error } = await supabase
        .rpc('get_user_notifications', {
            p_user_id: user.id,
            p_limit: limit,
            p_offset: offset
        });

    if (error) {
        console.error('Error fetching notifications via RPC:', error);
        throw error;
    }

    // The RPC returns data as JSON, so no re-formatting is needed here.
    return data || [];
}

// --- Feed & Gallery & Explore Actions ---
export async function getFeedPosts({ page = 1, limit = 5 }: { page: number, limit: number }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 1. Get list of users the current user is following
    const { data: supportedUsers, error: supportedError } = await supabase
        .from('supports')
        .select('supported_id')
        .eq('supporter_id', user.id)
        .eq('status', 'approved');

    if (supportedError) {
        console.error('Error fetching supported users:', supportedError);
        throw supportedError;
    }

    const supportedIds = supportedUsers.map(s => s.supported_id);
    const feedUserIds = [...supportedIds, user.id];

    // 2. Fetch posts from those users
    const { data: posts, error: postsError } = await supabase
        .from('emojis')
        .select('*, user:users!inner(*, moods(id))')
        .in('user_id', feedUserIds)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (postsError) {
        console.error('Error fetching feed posts:', postsError);
        throw postsError;
    }

    if (!posts || posts.length === 0) {
        return [];
    }
    
    const postIds = posts.map(p => p.id);

    // 3. Get like counts for those posts using the new RPC function
    const { data: likeCountsData, error: likeCountsError } = await supabase
        .rpc('get_like_counts_for_posts', { post_ids: postIds });

    if (likeCountsError) {
        console.error('Error fetching like counts:', likeCountsError);
        throw likeCountsError;
    }
    const likeCountMap = new Map(likeCountsData?.map(l => [l.emoji_id, l.like_count]) || []);


    // 4. Check which posts the current user has liked
    const { data: userLikes, error: userLikesError } = await supabase
        .from('likes')
        .select('emoji_id')
        .eq('user_id', user.id)
        .in('emoji_id', postIds);
        
    if (userLikesError) {
        console.error('Error fetching user likes:', userLikesError);
        throw userLikesError;
    }
    const userLikedSet = new Set(userLikes?.map(l => l.emoji_id) || []);

    // 5. Combine everything
    const feedPosts = posts.map(post => ({
        ...post,
        like_count: likeCountMap.get(post.id) || 0,
        is_liked: userLikedSet.has(post.id),
        user: {
          ...post.user,
          has_mood: Array.isArray(post.user?.moods) && post.user.moods.length > 0
        }
    }));

    return feedPosts as (EmojiState & { like_count: number; is_liked: boolean; user: { has_mood: boolean } })[];
}

export async function getGalleryPosts({ userId, page = 1, limit = 9 }: { userId: string, page: number, limit: number }) {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch posts for the specified user
    const { data: posts, error: postsError } = await supabase
        .from('emojis')
        .select('*, user:users!inner(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (postsError) {
        console.error('Error fetching gallery posts:', postsError);
        throw postsError;
    }
     if (!posts || posts.length === 0) {
        return [];
    }

    const postIds = posts.map(p => p.id);
    
    // Get like counts
    const { data: likeCountsData, error: likeCountsError } = await supabase
        .rpc('get_like_counts_for_posts', { post_ids: postIds });
    
    if (likeCountsError) throw likeCountsError;
    const likeCountMap = new Map(likeCountsData?.map(l => [l.emoji_id, l.like_count]) || []);

    // Check which posts the current user has liked
    let userLikedSet = new Set();
    if (currentUser) {
        const { data: userLikes, error: userLikesError } = await supabase
            .from('likes')
            .select('emoji_id')
            .eq('user_id', currentUser.id)
            .in('emoji_id', postIds);
        if (userLikesError) throw userLikesError;
        userLikedSet = new Set(userLikes?.map(l => l.emoji_id) || []);
    }

    // Combine
    const galleryPosts = posts.map(post => ({
        ...post,
        like_count: likeCountMap.get(post.id) || 0,
        is_liked: userLikedSet.has(post.id),
    }));

    return galleryPosts as (EmojiState & { like_count: number; is_liked: boolean })[];
}


export async function getExplorePosts({ page = 1, limit = 12 }: { page: number, limit: number }) {
    const supabase = createSupabaseServerClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 1. Fetch public posts with user info
    const { data: posts, error } = await supabase
        .from('emojis')
        .select('*, user:users!inner(*)')
        .eq('user.is_private', false)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error("Failed to load emojis for explore page", error);
        throw error;
    }
    
    if (!posts || posts.length === 0) {
        return [];
    }

    // 2. Get mood status for the authors of the fetched posts
    const userIds = [...new Set(posts.map(p => p.user_id))];
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: moods, error: moodError } = await supabase
        .from('moods')
        .select('user_id')
        .in('user_id', userIds)
        .gte('created_at', twentyFourHoursAgo);

    if (moodError) {
        console.error("Failed to fetch mood status for explore posts", moodError);
        // We can continue without mood status if this fails
    }

    const usersWithMood = new Set(moods?.map(m => m.user_id) || []);

    // 3. Combine post data with mood status
    const result = posts.map(post => ({
        ...post,
        user: {
            ...post.user,
            has_mood: usersWithMood.has(post.user_id)
        }
    }));
    
    return result as (EmojiState & { user: { has_mood: boolean } })[];
}

export async function searchUsers(query: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // 1. Search for users by name
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, picture, is_private')
        .ilike('name', `%${query}%`)
        .neq('id', currentUser?.id || '00000000-0000-0000-0000-000000000000') // Exclude current user
        .limit(15);

    if (error) {
        console.error("Failed to search users", error);
        throw error;
    }

    if (!users || users.length === 0) {
        return [];
    }
    
    // 2. Get mood status for the found users
    const userIds = users.map(u => u.id);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: moods, error: moodError } = await supabase
        .from('moods')
        .select('user_id')
        .in('user_id', userIds)
        .gte('created_at', twentyFourHoursAgo);

    if (moodError) {
        console.error("Failed to fetch mood status for searched users", moodError);
    }

    const usersWithMood = new Set(moods?.map(m => m.user_id) || []);

    // 3. Combine user data with mood status
    const result = users.map(user => ({
        ...user,
        has_mood: usersWithMood.has(user.id)
    }));

    return result;
}
    

```