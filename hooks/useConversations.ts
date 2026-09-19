// Backend-backed conversation list/detail/send-message state.
// In debug mode the hooks serve the in-memory dummy backend so the full
// workflow is explorable without a live andora-be.
import { useCallback, useEffect, useState } from 'react';
import {
  createConversation,
  getConversationDetail,
  listConversations,
  sendMessage,
} from '@/lib/andoraApi';
import {
  debugCreateConversation,
  debugGetConversationDetail,
  debugListConversations,
  debugSendTextTurn,
} from '@/lib/debugMockBackend';
import { useDebugMode } from '@/hooks/useDebugMode';
import type {
  AndoraChatTurn,
  AndoraConversation,
  AndoraConversationDetail,
} from '@/lib/andoraApi';
import { useSessionContext } from '@/hooks/useSession';

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useConversationList(search?: string) {
  const { accessToken } = useSessionContext();
  const { debugEnabled } = useDebugMode();
  const [items, setItems] = useState<AndoraConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (debugEnabled) {
      setLoading(true);
      setError(null);
      try {
        setItems(debugListConversations(search));
      } catch (e) {
        setError(message(e));
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!accessToken) {
      setLoading(false);
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await listConversations(fetch, accessToken, search));
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [accessToken, search, debugEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(
    async (title?: string) => {
      if (debugEnabled) {
        const created = debugCreateConversation(title);
        setItems((prev) => [created, ...prev]);
        return created;
      }
      if (!accessToken) throw new Error('Belum masuk.');
      const created = await createConversation(fetch, accessToken, title);
      setItems((prev) => [created, ...prev]);
      return created;
    },
    [accessToken, debugEnabled]
  );

  return { items, loading, error, refresh, create };
}

export function useConversationDetail(conversationId: string | null) {
  const { accessToken } = useSessionContext();
  const { debugEnabled } = useDebugMode();
  const [detail, setDetail] = useState<AndoraConversationDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(conversationId));
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const refresh = useCallback(async () => {
    if (!conversationId) {
      setLoading(false);
      return;
    }
    if (debugEnabled) {
      setLoading(true);
      setError(null);
      try {
        setDetail(debugGetConversationDetail(conversationId));
      } catch (e) {
        setError(message(e));
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setDetail(
        await getConversationDetail(fetch, accessToken, conversationId)
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }, [accessToken, conversationId, debugEnabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const send = useCallback(
    async (content: string): Promise<AndoraChatTurn> => {
      if (!conversationId) {
        throw new Error('Belum masuk atau conversation belum dipilih.');
      }
      setSending(true);
      try {
        const turn = debugEnabled
          ? debugSendTextTurn(conversationId, content)
          : await (async () => {
              if (!accessToken) {
                throw new Error('Belum masuk atau conversation belum dipilih.');
              }
              return sendMessage(fetch, accessToken, conversationId, content, 'text');
            })();
        setDetail((prev) =>
          prev
            ? {
                ...prev,
                messages: [
                  ...prev.messages,
                  turn.user_message,
                  turn.assistant_message,
                ],
              }
            : prev
        );
        return turn;
      } finally {
        setSending(false);
      }
    },
    [accessToken, conversationId, debugEnabled]
  );

  return { detail, loading, error, sending, refresh, send };
}
