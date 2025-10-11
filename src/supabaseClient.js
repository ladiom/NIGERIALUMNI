import { createClient } from '@supabase/supabase-js';

// Create a single Supabase client for interacting with the database.
// Supports Vite (import.meta.env) and Node scripts (process.env) seamlessly.
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : process?.env || {};

// Debug environment variables
console.log('Environment variables:', {
  hasImportMeta: typeof import.meta !== 'undefined',
  envKeys: Object.keys(env),
  viteUrl: env.VITE_SUPABASE_URL,
  viteKey: env.VITE_SUPABASE_ANON_KEY,
  reactUrl: env.REACT_APP_SUPABASE_URL,
  reactKey: env.REACT_APP_SUPABASE_ANON_KEY
});

// Trigger deployment with environment variables - updated

// Get Supabase credentials from environment variables only
const finalSupabaseUrl = env.VITE_SUPABASE_URL;
const finalSupabaseKey = env.VITE_SUPABASE_ANON_KEY;

console.log('Final Supabase config:', { 
  supabaseUrl: finalSupabaseUrl, 
  supabaseKey: finalSupabaseKey ? '***' + finalSupabaseKey.slice(-10) : 'undefined' 
});

if (!finalSupabaseUrl || !finalSupabaseKey) {
  console.error(
    'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
  );
}

const supabase = createClient(finalSupabaseUrl, finalSupabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'nigeria-alumni-platform'
    }
  },
  // Ensure direct connection to Supabase, bypass any proxy
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;