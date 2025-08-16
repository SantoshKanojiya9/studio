
'use server';

import { createSupabaseServerClient } from '@/lib/supabaseServer';

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
            )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

    if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
    
    if (!data) return [];
    
    // Get all support statuses for the actors in the notifications in one go
    const actorIds = data
        .map(n => n.actor && typeof n.actor === 'object' && !Array.isArray(n.actor) ? n.actor.id : null)
        .filter((id): id is string => id !== null);

    const supportStatusMap = new Map<string, 'approved' | 'pending'>();

    if (actorIds.length > 0) {
        const { data: supports, error: supportsError } = await supabase
            .from('supports')
            .select('supported_id, status')
            .eq('supporter_id', user.id)
            .in('supported_id', actorIds);

        if (supportsError) {
            console.error('Error fetching support statuses:', supportsError);
        } else if (supports) {
            supports.forEach(s => {
                if(s.status === 'approved' || s.status === 'pending') {
                    supportStatusMap.set(s.supported_id, s.status);
                }
            });
        }
    }

    // Combine data safely
    return data.map(n => {
        let actorSupportStatus: 'approved' | 'pending' | null = null;
        if (n.actor && typeof n.actor === 'object' && !Array.isArray(n.actor) && n.actor.id) {
            actorSupportStatus = supportStatusMap.get(n.actor.id) || null;
        }
        
        return {
            ...n,
            actor_support_status: actorSupportStatus,
        };
    });
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
