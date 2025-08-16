
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

    const { data: notifications, error } = await supabase
        .from('notifications')
        .select(`
            id,
            created_at,
            type,
            is_read,
            emoji_id,
            actor:users!notifications_actor_id_fkey (
                id,
                name,
                picture,
                is_private
            ),
            emoji:emojis (
                *,
                user:users(id, name, picture)
            )
        `)
        .eq('recipient_id', user.id)
        .not('actor', 'is', null) // Ensure notifications from deleted users are not fetched
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);


    if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }

    if (!notifications) return [];

    // Get the support status for all actors in a single query
    const actorIds = notifications.map(n => n.actor?.id).filter((id): id is string => !!id);
    const { data: supportStatuses, error: supportError } = await supabase
        .from('supports')
        .select('supported_id, status')
        .eq('supporter_id', user.id)
        .in('supported_id', actorIds);

    if (supportError) {
        console.error('Error fetching support statuses:', supportError);
        // Continue without support status if this fails
    }
    
    const supportStatusMap = new Map(supportStatuses?.map(s => [s.supported_id, s.status]) || []);

    const formattedData = notifications.map(n => {
      // Supabase returns single relations as objects, not arrays. This handles both cases just in case.
      const actor = Array.isArray(n.actor) ? n.actor[0] : n.actor;
      const emoji = Array.isArray(n.emoji) ? n.emoji[0] : n.emoji;
      
      return {
        ...n,
        actor,
        emoji,
        // Manually add the support status to the actor object for the client
        actor_support_status: actor ? supportStatusMap.get(actor.id) || null : null,
      };
    });

    return formattedData || [];
}

export async function markNotificationsAsRead() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking notifications as read:', error);
    }
}
