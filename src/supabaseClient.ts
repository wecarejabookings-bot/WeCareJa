import {
  supabase,
  supabaseClient,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from './lib/supabase';

export const url = SUPABASE_URL;
export const key = SUPABASE_ANON_KEY;

export { supabase, supabaseClient };
export default supabase;
