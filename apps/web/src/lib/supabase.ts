import { initializeSupabase, testSupabaseConnection as testConnection } from '@app/shared';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@app/shared';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Initialize the shared Supabase client only if credentials are available
if (supabaseUrl && supabaseAnonKey) {
  initializeSupabase(supabaseUrl, supabaseAnonKey);
}

// Test connection function
export async function testSupabaseConnection() {
  return testConnection();
}
