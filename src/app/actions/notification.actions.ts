
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

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('notifications')
        .select(`
            id,
            type,
            created_at,
            emoji_id,
            actor:users!notifications_actor_id_fkey(id, name, picture, is_private),
            emoji:emojis(
                id, created_at, user_id, model, expression, background_color, emoji_color, show_sunglasses, show_mustache,
                selected_filter, animation_type, shape, eye_style, mouth_style, eyebrow_style, feature_offset_x,
                feature_offset_y, caption
            )
        `)
        .eq('recipient_id', user.id)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
    const dataArray = Array.isArray(data) ? data : (data ? [data] : []);
    if (!dataArray || dataArray.length === 0) return [];
    
    // Get support status for all actors in one go
    const actorIds = [...new Set(dataArray.map(n => (n.actor as any)?.id).filter(Boolean))];
    if (actorIds.length === 0) {
        return dataArray.map(n => ({ ...n, actor_support_status: null }));
    }

    const { data: supports, error: supportsError } = await supabase
        .from('supports')
        .select('supported_id, status')
        .eq('supporter_id', user.id)
        .in('supported_id', actorIds);
        
    if (supportsError) {
        console.error('Error fetching support statuses for notifications', supportsError);
        // Continue without support status if it fails
    }

    const supportStatusMap = new Map(supports?.map(s => [s.supported_id, s.status]) || []);

    return dataArray.map(notification => ({
        ...notification,
        actor_support_status: supportStatusMap.get((notification.actor as any).id) || null
    }));
}
