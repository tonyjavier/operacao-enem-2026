import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

let client: SupabaseClient<Database> | null = null;
if (url && publishableKey) {
  client = createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function getSupabase(): SupabaseClient<Database> {
  if (!client) throw new Error('A conexão com o Supabase não foi configurada.');
  return client;
}

export const supabaseConfigured = Boolean(url && publishableKey);
