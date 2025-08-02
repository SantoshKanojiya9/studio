
import type { EmojiState } from "@/app/design/page";

/**
 * In a real app, this would fetch from a backend.
 * For this prototype, we'll simulate a "global" gallery by looking for
 * all `savedEmojiGallery` keys in localStorage. This is a hack to allow
 * multiple "users" (by using different browser profiles or clearing local storage)
 * to contribute to a shared explore page.
 * 
 * A more robust client-side simulation might involve namespacing, e.g.,
 * 'gallery_user1', 'gallery_user2'. For now, we assume only one such key exists.
 */
export function getAllSavedEmojis(): EmojiState[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const savedGallery = localStorage.getItem('savedEmojiGallery');
        if (savedGallery) {
            // In a real multi-user client setup, we'd iterate through all keys
            // but for this app, we'll just use the one.
            const gallery = JSON.parse(savedGallery) as EmojiState[];
            // Sort by creation date (newest first), assuming id is a timestamp
            return gallery.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        }
    } catch (error) {
        console.error("Failed to parse all saved emojis from localStorage", error);
    }
    
    return [];
}
