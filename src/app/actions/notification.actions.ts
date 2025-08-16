
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
    const supabase = createSupabaseServerClient(); // Use non-admin client to trigger realtime
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
            p_limit: limit,
            p_offset: (page - 1) * limit
        });

    if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
    
    return data || [];
}
