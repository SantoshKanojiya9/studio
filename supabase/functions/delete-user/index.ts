import 'https://deno.land/std@0.177.0/dotenv/load.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import { corsHeaders } from '../_shared/cors.ts';

async function handler(req: Request): Promise<Response> {
  try {
    // This is the core logic for deleting the user.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError) throw userError;
    if (!user) throw new Error('User not found.');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) throw updateError;
    
    await supabaseAdmin.auth.admin.signOut(user.id);

    return new Response(JSON.stringify({ message: `User ${user.id} marked as deleted.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

// This is the main server entry point.
// It handles the CORS pre-flight request and then passes other requests to the handler.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return await handler(req);
});
