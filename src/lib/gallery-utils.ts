
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
                user:user_id (
                    id,
                    name,
                    picture
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }
        
        // Supabase returns the foreign table data inside a nested object.
        // We need to flatten it slightly to match the EmojiState type.
        const formattedData = data.map(item => {
            const { user, ...rest } = item;
            return { ...rest, user: Array.isArray(user) ? user[0] : user };
        });

        return (formattedData as EmojiState[]) || [];
    } catch (error) {
        console.error("Failed to fetch all saved emojis from Supabase", error);
        return [];
    }
}
