
import type { EmojiState } from '@/app/design/page';
import type { PostViewEmoji } from '@/components/post-view';

// --- Global Post Cache ---

// A simple in-memory cache for posts.
// Key: emoji_id, Value: PostViewEmoji
const postCache = new Map<string, PostViewEmoji>();

export function updatePostCache(posts: (PostViewEmoji | EmojiState)[]) {
    if (!posts) return;
    posts.forEach(post => {
        // Ensure it's a fully-fledged PostViewEmoji with user data before caching
        if ('like_count' in post && post.user) { 
            postCache.set(post.id, post as PostViewEmoji);
        }
    });
}

export function getPostsFromCache(postIds: string[]): PostViewEmoji[] {
    return postIds.map(id => postCache.get(id)).filter(Boolean) as PostViewEmoji[];
}

export function getPostsByUserFromCache(userId: string): PostViewEmoji[] {
    const userPosts: PostViewEmoji[] = [];
    postCache.forEach(post => {
        // user_id is the author's id on the emoji record itself
        if (post.user_id === userId) {
            userPosts.push(post);
        }
    });
    return userPosts.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
}

// --- Global Profile Stats Cache ---

interface ProfileStats {
    supporterCount: number;
    supportingCount: number;
}

const profileStatsCache = new Map<string, ProfileStats>();

export function getProfileStatsFromCache(userId: string): ProfileStats | undefined {
    return profileStatsCache.get(userId);
}

export function updateProfileStatsCache(userId: string, stats: ProfileStats) {
    profileStatsCache.set(userId, stats);
}
    
