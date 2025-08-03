
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import { corsHeaders } from '../_shared/cors.ts';

// Create a Supabase client with the SERVICE_ROLE_KEY to perform admin actions
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get the user from the request's authorization header
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    ).auth.getUser();

    if (userError) {
      console.error('Error getting user:', userError);
      throw userError;
    }
    if (!user) {
      throw new Error('User not found.');
    }

    // 2. Delete the user from the auth schema using the admin client
    // The second argument `true` ensures it's a hard delete.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id, true);
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      throw deleteError;
    }

    // Note: The `users` and `emojis` table have a CASCADE delete rule.
    // Deleting the user from `auth.users` will automatically trigger
    // the deletion of their profile in `public.users` and all their
    // posts in `public.emojis`. No extra manual deletion is needed.

    return new Response(JSON.stringify({ message: `User ${user.id} deleted successfully.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
