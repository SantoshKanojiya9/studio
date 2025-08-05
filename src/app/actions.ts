
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper function to create a Supabase client for server actions
function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}


// --- Subscription Actions ---

export async function subscribe(subscribeeId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to subscribe.');
    }

    if (user.id === subscribeeId) {
        throw new Error('You cannot subscribe to yourself.');
    }

    const { error } = await supabase
        .from('subscriptions')
        .insert({
            subscriber_id: user.id,
            subscribee_id: subscribeeId,
        });

    if (error) {
        console.error('Error subscribing:', error);
        throw new Error('Could not subscribe to the user.');
    }

    // Create a notification for the user being followed
    const { error: notificationError } = await supabase.from('notifications').insert({
      recipient_id: subscribeeId,
      sender_id: user.id,
      type: 'follow'
    });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Not a critical error, so we don't throw
    }


    revalidatePath(`/gallery?userId=${subscribeeId}`);
}

export async function unsubscribe(subscribeeId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to unsubscribe.');
    }

    const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('subscriber_id', user.id)
        .eq('subscribee_id', subscribeeId);

    if (error) {
        console.error('Error unsubscribing:', error);
        throw new Error('Could not unsubscribe from the user.');
    }

    revalidatePath(`/gallery?userId=${subscribeeId}`);
}

export async function getSubscribersCount(userId: string) {
    const supabase = createSupabaseServerClient();
    const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('subscribee_id', userId);

    if (error) {
        console.error('Error getting subscribers count:', error);
        return 0;
    }

    return count ?? 0;
}


export async function getSubscriptionStatus(subscribeeId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return false;
    }
    
    const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', user.id)
        .eq('subscribee_id', subscribeeId)
        .maybeSingle();

    if (error) {
        console.error('Error getting subscription status:', error);
        return false;
    }

    return !!data;
}


// --- Notification Actions ---
export async function getNotifications() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('notifications')
        .select(`
            id,
            type,
            created_at,
            sender:sender_id (
                id,
                name,
                picture
            ),
            emoji:emoji_id (
                id,
                background_color,
                emoji_color,
                expression,
                model,
                shape,
                eye_style,
                mouth_style,
                eyebrow_style,
                show_sunglasses,
                show_mustache,
                animation_type,
                selected_filter,
                feature_offset_x,
                feature_offset_y
            )
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
    return data;
}
