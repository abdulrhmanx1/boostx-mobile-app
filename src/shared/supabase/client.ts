import { createClient } from '@supabase/supabase-js';

// Supabase environment variables placeholders
// To be configured in workspace .env files
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJplaceholderkey';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Custom helper to get/set connection modes for QA/STG/PROD environments
export const getSupabaseMode = () => {
  return localStorage.getItem('BOOSTX_SUPABASE_ENV') || 'staging';
};

export const setSupabaseMode = (mode: 'staging' | 'production') => {
  localStorage.setItem('BOOSTX_SUPABASE_ENV', mode);
};
