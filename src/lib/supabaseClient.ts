
import { createClient } from '@supabase/supabase-js';

// Note: supabaseUrl and supabaseAnonKey are retrieved from environment variables.
// Make sure they are correctly set in your .env.local file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or anon key. Make sure to set them in your .env.local file.');
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
