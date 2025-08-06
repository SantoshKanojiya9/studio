
'use client';

import type { EmojiState } from "@/app/design/page";
import { supabase } from "./supabaseClient";

/**
 * Fetches all emoji posts from the database, along with their author's info.
 */
export async function getAllSavedEmojis(): Promise<EmojiState[]> {
    try {
        const { data: emojis, error: emojisError } = await supabase
            .from('emojis')
            .select('*, user:users!inner(id, name, picture)') // Use inner join to only get emojis with users
            .order('created_at', { ascending: false });

        if (emojisError) {
            console.error('Supabase error fetching emojis:', emojisError);
            throw new Error(emojisError.message);
        }

        return (emojis as unknown as EmojiState[]) || [];
    } catch (error) {
        console.error("Failed to fetch all saved emojis from Supabase", error);
        throw error;
    }
}
