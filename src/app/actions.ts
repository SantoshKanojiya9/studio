
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


export async function deleteUserAccount() {
  const supabase = createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not found or not authenticated.');
  }

  // Use the service role key to perform admin actions
  // NOTE: This requires you to have SUPABASE_SERVICE_ROLE_KEY in your environment variables
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )


  // 1. Soft delete the user in the public.users table
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', user.id);

  if (updateError) {
    console.error('Error soft-deleting user:', updateError);
    throw new Error('Failed to update user profile for deletion.');
  }

  // 2. Sign out the user from all sessions
  const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(user.id);

  if (signOutError) {
    console.error('Error signing out user:', signOutError);
    // Non-fatal, we can continue
  }
  
  // 3. Clear the session cookie on the client side
  await supabase.auth.signOut();

  revalidatePath('/gallery');
  revalidatePath('/');
  
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
