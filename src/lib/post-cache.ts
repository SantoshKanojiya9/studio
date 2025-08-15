
import type { EmojiState } from '@/app/design/page';
import type { PostViewEmoji } from '@/components/post-view';

// A simple in-memory cache for posts.
// Key: emoji_id, Value: PostViewEmoji
const postCache = new Map<string, PostViewEmoji>();

export function updatePostCache(posts: (PostViewEmoji | EmojiState)[]) {
    if (!posts) return;
    posts.forEach(post => {
        if ('like_count' in post) { // Ensure it's a fully-fledged PostViewEmoji
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
        // Ensure user_id is checked correctly
        if (post.user_id === userId || post.user?.id === userId) {
            userPosts.push(post);
        }
    });
    return userPosts.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
}

    