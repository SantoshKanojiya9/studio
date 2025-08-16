
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
        .from('notifications')
        .select(`
            id,
            created_at,
            type,
            is_read,
            actor:actor_id (
                id,
                name,
                picture,
                is_private
            ),
            emoji:emoji_id (
                id, user_id, model, expression, background_color, emoji_color, show_sunglasses, 
                show_mustache, selected_filter, animation_type, shape, eye_style, mouth_style, 
                eyebrow_style, feature_offset_x, feature_offset_y, caption
            ),
            support:supports(supporter_id, supported_id, status)
        `)
        .eq('recipient_id', user.id)
        .eq('support.supporter_id', user.id) // Filter supports to the current user
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
    
    if (!data) return [];
    
    // The query now includes the support status directly, making the mapping much simpler and safer.
    return data.map(n => {
        // Supabase returns an array for the joined `support` table. We extract the first element if it exists.
        const supportStatus = n.support && Array.isArray(n.support) && n.support.length > 0 ? n.support[0].status : null;
        
        return {
            ...n,
            actor_support_status: supportStatus,
        };
    });
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
