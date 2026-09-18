// Supabase client singleton for Google SSO + session tokens.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

function supabaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi EXPO_PUBLIC_SUPABASE_URL.'
    );
  }
  return url;
}

function supabaseAnonKey(): string {
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      'Supabase belum dikonfigurasi. Isi EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return key;
}

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!cached) {
    cached = createClient(supabaseUrl(), supabaseAnonKey(), {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL &&
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );
}
