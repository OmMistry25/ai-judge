import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase client configuration
// These will be provided by the consuming application
let supabaseUrl = '';
let supabaseAnonKey = '';

// Function to initialize the client with environment variables
export function initializeSupabase(url: string, key: string) {
  supabaseUrl = url;
  supabaseAnonKey = key;
}

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw error here, let the consuming app handle initialization
  console.warn('Supabase not initialized. Call initializeSupabase() first.');
}

// Create Supabase client (will be undefined until initialized)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Test connection function
export async function testSupabaseConnection() {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return false;
  }

  try {
    const { error } = await supabase.from('queues').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
}