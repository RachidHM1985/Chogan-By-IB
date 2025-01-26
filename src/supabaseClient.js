import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


// Si l'URL ou la clé est manquante, une erreur sera levée
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
