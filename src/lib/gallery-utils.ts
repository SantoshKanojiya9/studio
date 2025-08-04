
'use client';

import type { EmojiState } from "@/app/design/page";
import { createSupabaseBrowserClient } from "./supabaseClient";

/**
 * Fetches all emoji posts from the database, along with their author's info.
 * This function now filters out emojis from users who have been soft-deleted.
 */
export async function getAllSavedEmojis(): Promise<EmojiState[]> {
    const supabase = createSupabaseBrowserClient();
    try {
        const { data: emojis, error: emojisError } = await supabase
            .from('emojis')
            .select('*, user:users!inner(*)') // Use inner join to only get emojis with users
            .is('user.deleted_at', null) // Filter out users who have a `deleted_at` timestamp
            .order('created_at', { ascending: false });

        if (emojisError) {
            console.error('Supabase error fetching emojis:', emojisError);
            throw new Error(emojisError.message);
        }

        return (emojis as EmojiState[]) || [];
    } catch (error) {
        console.error("Failed to fetch all saved emojis from Supabase", error);
        throw error;
    }
}
