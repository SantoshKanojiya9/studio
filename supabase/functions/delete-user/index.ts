import 'https://deno.land/std@0.177.0/dotenv/load.ts';
import { createClient } from 'https://deno.land/x/supabase@1.10.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main logic for handling the request
async function handler(req: Request) {
  // First, handle the pre-flight CORS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create a Supabase client with the user's auth token to get their ID
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('User not found.');

    // Create a Supabase admin client to perform privileged operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // Mark the user as deleted in the public users table
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Sign out the user from all sessions
    await supabaseAdmin.auth.admin.signOut(user.id);

    const data = { message: `User ${user.id} marked as deleted and signed out.` };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

// Serve the handler
Deno.serve(handler);
