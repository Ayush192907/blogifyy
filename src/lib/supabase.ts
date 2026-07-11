import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY) are missing in your local .env configuration! ' +
    'Please verify that your environment variables are configured correctly.'
  );
}

// Fallback to prevent relative URL requests (Vercel 404) if environment variables are not loaded in production
const validatedUrl = supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder-url.supabase.co';
const validatedKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(validatedUrl, validatedKey);
