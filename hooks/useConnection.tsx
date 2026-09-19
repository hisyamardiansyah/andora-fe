import {
  TokenSource,
  type TokenSourceFetchOptions,
  type TokenSourceResponseObject,
} from 'livekit-client';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SessionProvider, useSession } from '@livekit/components-react';
import { andoraApiBaseUrl, fetchLivekitToken } from '@/lib/andoraApi';
import { debugFetchLivekitToken } from '@/lib/debugMockBackend';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useSessionContext } from '@/hooks/useSession';

const sandboxID = process.env.EXPO_PUBLIC_LIVEKIT_SANDBOX_ID ?? '';
const agentName = process.env.EXPO_PUBLIC_LIVEKIT_AGENT_NAME || undefined;

interface PendingVoiceAuth {
  conversationId: string;
  accessToken: string;
}

interface ConnectionContextType {
  isConnectionActive: boolean;
  connectError: string | null;
  connect: (opts?: {
    conversationId?: string;
    accessToken?: string;
  }) => Promise<void>;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnectionActive: false,
  connectError: null,
  connect: async () => {},
  disconnect: () => {},
});

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return ctx;
}

interface ConnectionProviderProps {
  children: React.ReactNode;
}

function backendConfigured(): boolean {
  try {
    andoraApiBaseUrl();
    return true;
  } catch {
    return false;
  }
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const { accessToken: sessionToken } = useSessionContext();
  const { debugEnabled } = useDebugMode();
  const pendingRef = useRef<PendingVoiceAuth | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  sessionTokenRef.current = sessionToken;

  const tokenSource = useMemo(() => {
    if (debugEnabled) {
      const fetchDebugToken = async (
        _options: TokenSourceFetchOptions
      ): Promise<TokenSourceResponseObject> => {
        const conversationId = pendingRef.current?.conversationId ?? '';
        if (!conversationId) {
          throw new Error(
            'Conversation belum dibuat. Mulai percakapan baru dulu.'
          );
        }
        return debugFetchLivekitToken(conversationId);
      };
      return TokenSource.custom(fetchDebugToken);
    }
    if (backendConfigured()) {
      const fetchBackendToken = async (
        _options: TokenSourceFetchOptions
      ): Promise<TokenSourceResponseObject> => {
        const pending = pendingRef.current;
        const accessToken = pending?.accessToken ?? sessionTokenRef.current;
        const conversationId = pending?.conversationId ?? '';
        if (!accessToken) {
          throw new Error(
            'Belum masuk. Masuk dulu dengan akun Google untuk memakai suara.'
          );
        }
        if (!conversationId) {
          throw new Error(
            'Conversation belum dibuat. Mulai percakapan baru dulu.'
          );
        }
        // POST /livekit/token validates room_name = andora-{conversation_id}.
        return fetchLivekitToken(fetch, accessToken, conversationId);
      };
      return TokenSource.custom(fetchBackendToken);
    }
    if (sandboxID) {
      return TokenSource.sandboxTokenServer(sandboxID);
    }
    return TokenSource.custom(async () => {
      throw new Error(
        'Backend andora-be belum dikonfigurasi. Isi EXPO_PUBLIC_ANDORA_API_URL.'
      );
    });
  }, [debugEnabled]);

  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );
  const { start: startSession, end: endSession } = session;

  const connect = useCallback(
    async (opts?: { conversationId?: string; accessToken?: string }) => {
      setConnectError(null);
      pendingRef.current = {
        conversationId: opts?.conversationId ?? '',
        accessToken: opts?.accessToken ?? sessionTokenRef.current ?? '',
      };
      // Debug mode has no LiveKit room; the assistant screen simulates
      // the voice turn against the dummy backend instead.
      if (debugEnabled) {
        setIsConnectionActive(true);
        return;
      }
      setIsConnectionActive(true);
      try {
        await startSession();
      } catch (error) {
        setIsConnectionActive(false);
        const message = error instanceof Error ? error.message : String(error);
        setConnectError(message);
        throw error;
      }
    },
    [startSession, debugEnabled]
  );

  const disconnect = useCallback(() => {
    setIsConnectionActive(false);
    pendingRef.current = null;
    endSession();
  }, [endSession]);

  const value = useMemo(() => {
    return { isConnectionActive, connectError, connect, disconnect };
  }, [isConnectionActive, connectError, connect, disconnect]);

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>
        {children}
      </ConnectionContext.Provider>
    </SessionProvider>
  );
}
