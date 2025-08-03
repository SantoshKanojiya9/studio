
import type { EmojiState } from "@/app/design/page";
import { supabase } from "./supabaseClient";

/**
 * Fetches all emoji posts from the database, along with their author's info.
 */
export async function getAllSavedEmojis(): Promise<EmojiState[]> {
    try {
        const { data: emojis, error: emojisError } = await supabase
            .from('emojis')
            .select('*')
            .order('created_at', { ascending: false });

        if (emojisError) {
            console.error('Supabase error fetching emojis:', emojisError);
            throw new Error(emojisError.message);
        }

        if (!emojis) {
            return [];
        }

        // Get all unique user IDs from the emojis
        const userIds = [...new Set(emojis.map(e => e.user_id).filter(id => id))];

        if (userIds.length === 0) {
            return emojis as EmojiState[];
        }

        // Fetch user profiles for those user IDs
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, picture')
            .in('id', userIds);

        if (usersError) {
            console.error('Supabase error fetching users:', usersError);
            throw new Error(usersError.message);
        }

        // Create a map of user profiles for easy lookup
        const userMap = new Map(users.map(u => [u.id, u]));

        // Combine emojis with their user profiles
        const emojisWithUsers = emojis.map(emoji => {
            return {
                ...emoji,
                user: userMap.get(emoji.user_id) || null
            };
        });

        return (emojisWithUsers as EmojiState[]) || [];
    } catch (error) {
        console.error("Failed to fetch all saved emojis from Supabase", error);
        throw error;
    }
}
