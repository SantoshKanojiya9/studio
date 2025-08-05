
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

// This is the new server action that will perform the soft delete.
// It uses an admin client to securely update the user's profile.
export async function deleteUserAccount() {
    const supabase = createSupabaseServerClient();

    // First, get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        // Throw an error that will be caught by the calling component
        throw new Error('User not found or not authenticated.');
    }

    // Create a Supabase client with the service_role key to perform admin actions
    // This client can bypass RLS policies.
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
    
    // Soft delete the user by updating their profile in the public.users table
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
        console.error('Error soft deleting user:', updateError);
        // Throw an error to be caught by the UI
        throw new Error('Could not update user profile for deletion.');
    }

    // It's good practice to sign the user out of all sessions after deletion
    await supabase.auth.signOut();
    
    // Return a success object instead of null for clarity
    return { success: true };
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
