import {
  TokenSource,
  type TokenSourceFetchOptions,
  type TokenSourceResponseObject,
} from 'livekit-client';
import { createContext, useContext, useMemo, useState } from 'react';
import { SessionProvider, useSession } from '@livekit/components-react';
import { parseAndoraTokenResponse } from '@/lib/andoraToken';

const sandboxID = process.env.EXPO_PUBLIC_LIVEKIT_SANDBOX_ID ?? '';
const andoraTokenUrl = process.env.EXPO_PUBLIC_ANDORA_TOKEN_URL ?? '';
const agentName = process.env.EXPO_PUBLIC_LIVEKIT_AGENT_NAME || undefined;

const hardcodedUrl = '';
const hardcodedToken = '';

const homepageAgentUrl = 'https://livekit.com/api/homepage-agent/token';

async function fetchAndoraToken(
  options: TokenSourceFetchOptions
): Promise<TokenSourceResponseObject> {
  const res = await fetch(andoraTokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomName: options.roomName,
      participantName: options.participantName,
      participantIdentity: options.participantIdentity,
      agentName: options.agentName ?? agentName,
    }),
  });
  if (!res.ok) {
    throw new Error('Andora token server responded with status ' + res.status);
  }
  const data = await res.json();
  return parseAndoraTokenResponse(data);
}

interface ConnectionContextType {
  isConnectionActive: boolean;
  connect: () => void;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnectionActive: false,
  connect: () => {},
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

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);

  const tokenSource = useMemo(() => {
    if (andoraTokenUrl) {
      return TokenSource.custom(fetchAndoraToken);
    }
    if (sandboxID) {
      return TokenSource.sandboxTokenServer(sandboxID);
    }
    if (hardcodedUrl && hardcodedToken) {
      return TokenSource.literal({
        serverUrl: hardcodedUrl,
        participantToken: hardcodedToken,
      });
    }
    return TokenSource.endpoint(homepageAgentUrl);
  }, []);

  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );
  const { start: startSession, end: endSession } = session;

  const value = useMemo(() => {
    return {
      isConnectionActive,
      connect: () => {
        setIsConnectionActive(true);
        startSession();
      },
      disconnect: () => {
        setIsConnectionActive(false);
        endSession();
      },
    };
  }, [startSession, endSession, isConnectionActive]);

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>
        {children}
      </ConnectionContext.Provider>
    </SessionProvider>
  );
}
