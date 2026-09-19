// App session: Supabase Google SSO, access token for andora-be calls.
import { createURL } from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  DEBUG_ACCESS_TOKEN,
  DEBUG_USER_ADDRESS,
  DEBUG_USER_EMAIL,
  DEBUG_USER_ID,
  DEBUG_USER_NAME,
  DEBUG_USER_PHONE,
} from '@/lib/debugMockBackend';
import { useDebugMode } from '@/hooks/useDebugMode';

WebBrowser.maybeCompleteAuthSession();

export const SESSION_CANCELLED_CODE = 'SESSION_CANCELLED';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  accessToken: null,
  loading: true,
  configured: false,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSessionContext must be used within SessionProvider');
  }
  return ctx;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const { debugEnabled } = useDebugMode();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debugSession = useMemo(
    () =>
      ({
        access_token: DEBUG_ACCESS_TOKEN,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'debug-refresh-token',
        user: {
          id: DEBUG_USER_ID,
          email: DEBUG_USER_EMAIL,
          user_metadata: {
            full_name: DEBUG_USER_NAME,
            phone: DEBUG_USER_PHONE,
            address: DEBUG_USER_ADDRESS,
          },
        },
      }) as unknown as Session,
    []
  );

  useEffect(() => {
    if (debugEnabled) {
      setSession(debugSession);
      setError(null);
      setLoading(false);
      return;
    }
    if (!configured) {
      setLoading(false);
      return;
    }
    let active = true;
    const supabase = getSupabase();
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(sessionError.message);
        setSession(data.session);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(errorMessage(e));
        setLoading(false);
      });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, next) => {
        if (active) setSession(next);
      }
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [configured, debugEnabled, debugSession]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (debugEnabled) {
      setSession(debugSession);
      return;
    }
    const supabase = getSupabase();
    const redirectTo = createURL('auth/callback');
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (oauthError || !data?.url) {
      throw new Error(oauthError?.message ?? 'Gagal memulai login Google');
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      const err = new Error('Login Google dibatalkan') as Error & {
        code?: string;
      };
      err.code = SESSION_CANCELLED_CODE;
      throw err;
    }
    const code = new URL(result.url).searchParams.get('code');
    if (!code) {
      throw new Error('Login Google gagal: kode otorisasi tidak ditemukan');
    }
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );
    if (exchangeError) {
      throw new Error(exchangeError.message);
    }
  }, [debugEnabled, debugSession]);

  const signOut = useCallback(async () => {
    setError(null);
    if (debugEnabled) {
      setSession(null);
      return;
    }
    if (!configured) {
      setSession(null);
      return;
    }
    const { error: signOutError } = await getSupabase().auth.signOut();
    if (signOutError) {
      throw new Error(signOutError.message);
    }
    setSession(null);
  }, [configured, debugEnabled]);

  const value = useMemo<SessionContextType>(
    () => ({
      session,
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      loading,
      configured,
      error,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, configured, error, signInWithGoogle, signOut]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
