import { initializeSupabase, testSupabaseConnection as testConnection } from '@app/shared';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@app/shared';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Initialize the shared Supabase client
initializeSupabase(supabaseUrl, supabaseAnonKey);

// Create local Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Test connection function
export async function testSupabaseConnection() {
  return testConnection();
}
