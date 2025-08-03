

import type { EmojiState } from "@/app/design/page";
import { supabase } from "./supabaseClient";

/**
 * Fetches all emoji posts from the database, along with their author's info.
 */
export async function getAllSavedEmojis(): Promise<EmojiState[]> {
    try {
        const { data, error } = await supabase
            .from('emojis')
            .select(`
                *,
                user:users (
                    id,
                    name,
                    picture
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error in getAllSavedEmojis:', error);
            throw new Error(error.message);
        }
        
        // Supabase returns the joined user data in a nested object. We need to handle the case where it might be an array.
        const emojisWithUsers = (data || []).map(emoji => {
            return {
                ...emoji,
                user: Array.isArray(emoji.user) ? emoji.user[0] : emoji.user
            }
        });

        return (emojisWithUsers as EmojiState[]) || [];
    } catch (error) {
        console.error("Failed to fetch all saved emojis from Supabase", error);
        throw error;
    }
}

