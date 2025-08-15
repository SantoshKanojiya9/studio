
import type { EmojiState } from '@/app/design/page';
import type { PostViewEmoji } from '@/components/post-view';

// --- Global Post Cache ---

// A simple in-memory cache for posts.
// Key: emoji_id, Value: PostViewEmoji
const postCache = new Map<string, PostViewEmoji>();

// --- Global User Cache ---
interface UserInfo {
    name: string;
    picture: string;
}
const userCache = new Map<string, UserInfo>();

// Function to update a user's info in the user cache and propagate to postCache
export function updateUserInCache(userId: string, updatedInfo: Partial<UserInfo>) {
    // Update user cache
    const existingUser = userCache.get(userId) || {} as UserInfo;
    const newUserInfo = { ...existingUser, ...updatedInfo };
    userCache.set(userId, newUserInfo);

    // Propagate changes to all posts by this user in postCache
    postCache.forEach((post, postId) => {
        if (post.user_id === userId && post.user) {
            const updatedPost = {
                ...post,
                user: {
                    ...post.user,
                    ...updatedInfo
                }
            };
            postCache.set(postId, updatedPost);
        }
    });
}

// Function to get a user's info, prioritizing cache
export function getUserFromCache(userId: string): UserInfo | undefined {
    return userCache.get(userId);
}


export function updatePostCache(posts: (PostViewEmoji | EmojiState)[]) {
    if (!posts) return;
    posts.forEach(post => {
        // Ensure it's a fully-fledged PostViewEmoji with user data before caching
        if ('like_count' in post && post.user) { 
            const finalPost = post as PostViewEmoji;

            // Check userCache for latest user info
            const cachedUser = getUserFromCache(finalPost.user.id);
            if (cachedUser) {
                finalPost.user.name = cachedUser.name;
                finalPost.user.picture = cachedUser.picture;
            } else if (finalPost.user) {
                // If user not in cache, add them
                userCache.set(finalPost.user.id, { name: finalPost.user.name, picture: finalPost.user.picture });
            }

            postCache.set(finalPost.id, finalPost);
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
    
