
import type { EmojiState } from "@/app/design/page";
import { supabase } from "./supabaseClient";

/**
 * Fetches all emoji posts from the database.
 */
export async function getAllSavedEmojis(): Promise<EmojiState[]> {
    try {
        const { data, error } = await supabase
            .from('emojis')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }
        
        return (data as EmojiState[]) || [];
    } catch (error) {
        console.error("Failed to fetch all saved emojis from Supabase", error);
        return [];
    }
}
