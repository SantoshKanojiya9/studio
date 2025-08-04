
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteUserAccount() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

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
