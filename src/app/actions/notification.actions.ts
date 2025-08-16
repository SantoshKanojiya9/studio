
'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { EmojiState } from '@/app/design/page';

// --- Notification Actions ---
type NotificationPayload = {
    recipient_id: string;
    actor_id: string;
    type: 'new_supporter' | 'new_like' | 'new_support_request' | 'support_request_approved';
    emoji_id?: string;
}

export async function createNotification(payload: NotificationPayload) {
    const supabase = createSupabaseServerClient(); 
    const { error } = await supabase.from('notifications').insert(payload);
    if (error) {
        console.error('Error creating notification:', error);
    }
}


export async function getNotifications({ page = 1, limit = 15 }: { page: number, limit: number }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .rpc('get_notifications_for_user', {
            p_recipient_id: user.id,
            p_current_user_id: user.id,
            p_limit: limit,
            p_offset: (page - 1) * limit,
        });

    if (error) {
        console.error('Error fetching notifications via RPC:', error);
        throw error;
    }
    
    if (!data) return [];
    
    // The RPC returns `actor` and `emoji` as fully-formed objects.
    // No need to parse them again.
    return data.map(n => ({
        ...n,
        actor: n.actor,
        emoji: n.emoji?.id ? n.emoji : null, // Ensure emoji is not just an object with a null id
    }));
}


export async function markNotificationsAsRead() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Fetch unread notifications first
    const { data: unreadNotifications, error: fetchError } = await supabase
        .from('notifications')
        .select('id')
        .eq('recipient_id', user.id)
        .eq('is_read', false);

    if (fetchError || !unreadNotifications || unreadNotifications.length === 0) {
        if(fetchError) console.error('Error fetching unread notifications:', fetchError);
        return; // No unread notifications to mark
    }
    
    const idsToUpdate = unreadNotifications.map(n => n.id);

    // Then, update only those notifications
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', idsToUpdate);

    if (error) {
        console.error('Error marking notifications as read:', error);
    }
}
