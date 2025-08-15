
'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { EmojiState } from '@/app/design/page';

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
            emojis (
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
    
    // Un-nest the emoji data
    const flattenedData = data.map(m => {
        const { emojis, ...mood } = m;
        return { ...mood, ...(emojis as any) };
    });

    // 3. Check which moods have been viewed by the current user
    const moodIds = flattenedData.map(m => m.mood_id);
    if (moodIds.length === 0) {
        return flattenedData.map(mood => ({ ...mood, is_viewed: false }));
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

    const result = flattenedData.map(mood => ({
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
    if (!posts || posts.length === 0) return [];

    const emojiIds = posts.map(p => p.id);
    
    const { data: likeCountsData, error: likeCountsError } = await supabase.rpc('get_like_counts_for_emojis', { p_emoji_ids: emojiIds });
    const { data: likedStatuses, error: likedError } = await supabase.from('likes').select('emoji_id').eq('user_id', currentUser.id).in('emoji_id', emojiIds);

    if (likeCountsError) console.error("Error getting like counts:", likeCountsError);
    if (likedError) console.error("Error getting liked status:", likedError);

    const likeCountsMap = new Map(likeCountsData?.map((l: any) => [l.emoji_id, l.like_count]) || []);
    const likedSet = new Set(likedStatuses?.map(l => l.emoji_id) || []);

    return posts.map(post => ({
        ...(post as unknown as EmojiState),
        user: { ...post.user, has_mood: post.user?.moods?.length > 0 } as any,
        like_count: likeCountsMap.get(post.id) || 0,
        is_liked: likedSet.has(post.id),
    }));
}

export async function getGalleryPosts({ userId }: { userId: string }) {
    const supabase = createSupabaseServerClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const { data: posts, error: postsError } = await supabase
        .from('emojis')
        .select('*, user:users!inner(id, name, picture)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
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
            has_mood: post.user && post.user.moods ? post.user.moods.length > 0 : false
        } as any,
    }));
}
