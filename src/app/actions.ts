
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

    const { data, error } = await supabase
        .rpc('get_supporters_with_status', {
            p_user_id: userId,
            p_current_user_id: currentUser?.id,
            p_limit: limit,
            p_offset: (page - 1) * limit
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

    const { data, error } = await supabase
        .rpc('get_supporting_with_status', {
            p_user_id: userId,
            p_current_user_id: currentUser?.id,
            p_limit: limit,
            p_offset: (page - 1) * limit
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
    
    const { data, error } = await supabase
        .rpc('get_paginated_likers', {
            p_emoji_id: emojiId,
            p_current_user_id: currentUser?.id,
            p_limit: limit,
            p_offset: (page - 1) * limit
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

    const { data, error } = await supabase
        .from('notifications')
        .select(`
            id,
            type,
            created_at,
            emoji_id,
            actor:users!notifications_actor_id_fkey(id, name, picture, is_private),
            emoji:emojis(
                id, created_at, user_id, model, expression, background_color, emoji_color, show_sunglasses, show_mustache,
                selected_filter, animation_type, shape, eye_style, mouth_style, eyebrow_style, feature_offset_x,
                feature_offset_y, caption,
                user:users(id, name, picture)
            )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
    if (!data) return [];
    
    // Get support status for all actors in one go
    const actorIds = [...new Set(data.map(n => (n.actor as any)?.id).filter(Boolean))];
    if (actorIds.length === 0) {
        return data.map(n => ({ ...n, actor_support_status: null }));
    }

    const { data: supports, error: supportsError } = await supabase
        .from('supports')
        .select('supported_id, status')
        .eq('supporter_id', user.id)
        .in('supported_id', actorIds);
        
    if (supportsError) {
        console.error('Error fetching support statuses for notifications', supportsError);
        // Continue without support status if it fails
    }

    const supportStatusMap = new Map(supports?.map(s => [s.supported_id, s.status]) || []);

    return data.map(notification => ({
        ...notification,
        actor_support_status: supportStatusMap.get((notification.actor as any).id) || null
    }));
}

// --- Feed & Gallery & Explore Actions ---

export async function getFeedMoods() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get IDs of users the current user is following
    const { data: supportedUsers, error: supportedError } = await supabase
        .from('supports')
        .select('supported_id')
        .eq('supporter_id', user.id)
        .eq('status', 'approved');

    if (supportedError) {
        console.error('Error fetching supported users for moods:', supportedError);
        throw supportedError;
    }
    
    const supportedIds = supportedUsers.map(s => s.supported_id);
    const moodFeedUserIds = [user.id, ...supportedIds];

    // 2. Fetch moods from those users created within the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('moods')
        .select(`
            mood_id:id,
            mood_created_at:created_at,
            mood_user_id:user_id,
            mood_user:users (id, name, picture),
            ...emojis (
                id, created_at, user_id, model, expression, background_color, emoji_color, show_sunglasses, show_mustache,
                selected_filter, animation_type, shape, eye_style, mouth_style, eyebrow_style, feature_offset_x,
                feature_offset_y, caption
            )
        `)
        .in('user_id', moodFeedUserIds)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch moods", error);
        throw error;
    }
    if (!data) return [];

    // 3. Check which moods have been viewed by the current user
    const moodIds = data.map(m => m.mood_id);
    if (moodIds.length === 0) {
        return data.map(mood => ({ ...mood, is_viewed: false }));
    }

    const { data: viewedMoods, error: viewedError } = await supabase
        .from('mood_views')
        .select('mood_id')
        .eq('viewer_id', user.id)
        .in('mood_id', moodIds);

    if (viewedError) {
        console.error("Failed to fetch viewed moods:", viewedError);
        // Continue without view status if this fails
    }

    const viewedMoodsSet = new Set(viewedMoods?.map(vm => vm.mood_id) || []);

    const result = data.map(mood => ({
        ...mood,
        is_viewed: viewedMoodsSet.has(mood.mood_id)
    })).sort((a, b) => {
        // Sort own mood to the front, then by creation date
        if (a.mood_user_id === user.id) return -1;
        if (b.mood_user_id === user.id) return 1;
        return new Date(b.mood_created_at).getTime() - new Date(a.mood_created_at).getTime();
    });

    return result;
}

export async function getFeedPosts({ page = 1, limit = 5 }: { page: number, limit: number }) {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error("Not authenticated");

    const { data: supportedUsers, error: supportedError } = await supabase
        .from('supports')
        .select('supported_id')
        .eq('supporter_id', currentUser.id)
        .eq('status', 'approved');

    if (supportedError) {
        console.error('Error fetching supported users:', supportedError);
        throw supportedError;
    }
    const supportedIds = supportedUsers.map(s => s.supported_id);
    const feedUserIds = [currentUser.id, ...supportedIds];

    const { data: posts, error: postsError } = await supabase
        .from('emojis')
        .select('*, user:users(id, name, picture, moods(user_id))')
        .in('user_id', feedUserIds)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (postsError) {
        console.error('Error fetching feed posts:', postsError);
        throw postsError;
    }
    if (!posts) return [];

    const emojiIds = posts.map(p => p.id);
    if (emojiIds.length === 0) {
        return posts.map(post => ({
            ...(post as unknown as EmojiState),
            user: { ...post.user, has_mood: post.user?.moods.length > 0 } as any,
            like_count: 0,
            is_liked: false,
        }));
    }
    
    const { data: likeCountsData, error: likeCountsError } = await supabase.rpc('get_like_counts_for_emojis', { p_emoji_ids: emojiIds });
    const { data: likedStatuses, error: likedError } = await supabase.from('likes').select('emoji_id').eq('user_id', currentUser.id).in('emoji_id', emojiIds);

    if (likeCountsError) console.error("Error getting like counts:", likeCountsError);
    if (likedError) console.error("Error getting liked status:", likedError);

    const likeCountsMap = new Map(likeCountsData?.map((l: any) => [l.emoji_id, l.like_count]) || []);
    const likedSet = new Set(likedStatuses?.map(l => l.emoji_id) || []);

    return posts.map(post => ({
        ...(post as unknown as EmojiState),
        user: { ...post.user, has_mood: post.user?.moods.length > 0 } as any,
        like_count: likeCountsMap.get(post.id) || 0,
        is_liked: likedSet.has(post.id),
    }));
}

export async function getGalleryPosts({ userId, page = 1, limit = 9 }: { userId: string, page: number, limit: number }) {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { data: posts, error: postsError } = await supabase
        .from('emojis')
        .select('*, user:users!inner(id, name, picture)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
    
    if (postsError) {
        console.error('Error fetching gallery posts:', postsError);
        throw postsError;
    }
    if (!posts) return [];

    const emojiIds = posts.map(p => p.id);
    if (emojiIds.length === 0) {
        return posts.map(post => ({
            ...(post as unknown as EmojiState),
            user: post.user as any,
            like_count: 0,
            is_liked: false,
        }));
    }

    const { data: likeCountsData, error: likeCountsError } = await supabase.rpc('get_like_counts_for_emojis', { p_emoji_ids: emojiIds });
    
    let likedSet = new Set<string>();
    if (currentUser) {
        const { data: likedStatuses, error: likedError } = await supabase.from('likes').select('emoji_id').eq('user_id', currentUser.id).in('emoji_id', emojiIds);
        if (likedError) console.error("Error getting liked status:", likedError);
        else likedSet = new Set(likedStatuses?.map(l => l.emoji_id) || []);
    }

    if (likeCountsError) console.error("Error getting like counts:", likeCountsError);

    const likeCountsMap = new Map(likeCountsData?.map((l: any) => [l.emoji_id, l.like_count]) || []);

    return posts.map(post => ({
        ...(post as unknown as EmojiState),
        user: post.user as any,
        like_count: likeCountsMap.get(post.id) || 0,
        is_liked: likedSet.has(post.id)
    }));
}


export async function getExplorePosts({ page = 1, limit = 12 }: { page: number, limit: number }) {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Directly query public posts and join user data
    const { data: posts, error: postsError } = await supabase
        .from('emojis')
        .select('*, user:users!inner(id, name, picture, is_private, moods(user_id))')
        .eq('user.is_private', false)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (postsError) {
        console.error('Error fetching explore posts:', postsError);
        throw postsError;
    }
    if (!posts) return [];

    const emojiIds = posts.map(p => p.id);
    if (emojiIds.length === 0) {
        return [];
    }

    // Get like counts and liked statuses in separate queries
    const { data: likeCountsData, error: likeCountsError } = await supabase.rpc('get_like_counts_for_emojis', { p_emoji_ids: emojiIds });
    if (likeCountsError) console.error("Error getting like counts:", likeCountsError);
    
    let likedSet = new Set<string>();
    if (currentUser) {
        const { data: likedStatuses, error: likedError } = await supabase.from('likes').select('emoji_id').eq('user_id', currentUser.id).in('emoji_id', emojiIds);
        if (likedError) console.error("Error getting liked status:", likedError);
        else likedSet = new Set(likedStatuses?.map(l => l.emoji_id) || []);
    }

    const likeCountsMap = new Map(likeCountsData?.map((l: any) => [l.emoji_id, l.like_count]) || []);

    // Combine all the data
    return posts.map(post => ({
        ...(post as unknown as EmojiState),
        like_count: likeCountsMap.get(post.id) || 0,
        is_liked: likedSet.has(post.id),
        user: {
            ...post.user,
            has_mood: post.user ? post.user.moods.length > 0 : false
        } as any,
    }));
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

  
