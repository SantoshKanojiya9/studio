
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

// --- User Profile Actions ---

export async function getUserProfile(userId: string) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('users')
        .select('id, name, picture')
        .eq('id', userId)
        .single();
    if (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
    return data;
}
