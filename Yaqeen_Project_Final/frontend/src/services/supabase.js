import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found. Using localStorage fallback.');
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const isSupabaseAvailable = () => !!supabase;
