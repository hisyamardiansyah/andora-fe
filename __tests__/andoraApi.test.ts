// Contract tests for the shipped andora-be REST client (lib/andoraApi.ts).
// The fetch boundary is stubbed to behave like ANDORA.postman_collection.json:
// health, create (201), list/get/search conversations, send text/voice
// message, and livekit token with room_name = andora-{conversation_id}.
import {
  checkHealth,
  createConversation,
  fetchLivekitToken,
  getConversationDetail,
  listConversations,
  sendMessage,
} from '../lib/andoraApi';
import type { FetchLike } from '../lib/andoraApi';

process.env.EXPO_PUBLIC_ANDORA_API_URL = 'http://127.0.0.1:8000';

const CONV_ID = '2a2d3b52-9d20-4a13-8f1d-3c29d6c3e2c1';
const ACCESS = 'supabase-access-token';

const baseConversation = {
  id: CONV_ID,
  user_id: 'user-1',
  title: 'Percakapan Baru',
  last_message_preview: null,
  last_message_at: null,
  created_at: '2026-09-18T10:00:00+00:00',
  updated_at: '2026-09-18T10:00:00+00:00',
};

const userMessage = {
  id: 'msg-user-1',
  conversation_id: CONV_ID,
  role: 'user',
  content:
    'Halo Andora, saya ingin mengetahui cara mengurus surat keterangan domisili.',
  modality: 'text',
  created_at: '2026-09-18T10:30:00+00:00',
};

const assistantMessage = {
  id: 'msg-asst-1',
  conversation_id: CONV_ID,
  role: 'assistant',
  content: 'Baik. Surat domisilinya untuk keperluan apa?',
  modality: 'text',
  created_at: '2026-09-18T10:30:02+00:00',
};

interface LoggedCall {
  url: string;
  init?: RequestInit;
}

// Stub fetch implementing the Postman sequence.
function stubFetch(log: LoggedCall[]): FetchLike {
  return async (url: string, init?: RequestInit) => {
    log.push({ url, init });
    const method = init?.method ?? 'GET';
    const auth = (init?.headers as Record<string, string> | undefined)
      ?.Authorization;
    const json = (body: unknown, status = 200) => ({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    });
    if (url.endsWith('/health')) {
      return json({ status: 'ok' });
    }
    if (auth !== `Bearer ${ACCESS}`) {
      return json({ detail: 'Invalid or expired token' }, 401);
    }
    if (url.endsWith('/conversations') && method === 'POST') {
      return json({ ...baseConversation }, 201);
    }
    if (url.includes('/conversations?search=')) {
      expect(url).toContain('search=surat');
      return json([{ ...baseConversation, title: 'Surat Domisili' }]);
    }
    if (url.endsWith('/conversations') && method === 'GET') {
      return json([{ ...baseConversation }]);
    }
    if (
      url.endsWith(`/conversations/${CONV_ID}/messages`) &&
      method === 'POST'
    ) {
      const body = JSON.parse(String(init?.body)) as {
        content: string;
        modality: string;
      };
      expect(typeof body.content).toBe('string');
      expect(['text', 'voice']).toContain(body.modality);
      return json({
        conversation_id: CONV_ID,
        user_message: {
          ...userMessage,
          content: body.content,
          modality: body.modality,
        },
        assistant_message: assistantMessage,
      });
    }
    if (url.endsWith(`/conversations/${CONV_ID}`) && method === 'GET') {
      return json({
        ...baseConversation,
        messages: [userMessage, assistantMessage],
      });
    }
    if (url.endsWith('/livekit/token') && method === 'POST') {
      const body = JSON.parse(String(init?.body)) as {
        conversation_id: string;
      };
      return json({
        server_url: 'wss://livekit.example.com',
        participant_token: 'participant-jwt',
        room_name: `andora-${body.conversation_id}`,
        conversation_id: body.conversation_id,
      });
    }
    throw new Error(`unexpected request ${method} ${url}`);
  };
}

describe('andora-be contract via shipped client', () => {
  it('runs the full Postman sequence in order', async () => {
    const log: LoggedCall[] = [];
    const fetchImpl = stubFetch(log);

    const health = await checkHealth(fetchImpl);
    expect(health).toEqual({ status: 'ok' });

    const created = await createConversation(
      fetchImpl,
      ACCESS,
      'Percakapan Baru'
    );
    expect(created.id).toBe(CONV_ID);

    const listed = await listConversations(fetchImpl, ACCESS);
    expect(listed).toHaveLength(1);

    const searched = await listConversations(fetchImpl, ACCESS, 'surat');
    expect(searched[0]?.title).toContain('Surat');

    const detail = await getConversationDetail(fetchImpl, ACCESS, CONV_ID);
    expect(detail.messages.map((m) => m.role)).toEqual(['user', 'assistant']);

    const turn = await sendMessage(
      fetchImpl,
      ACCESS,
      CONV_ID,
      userMessage.content,
      'text'
    );
    expect(turn.user_message.role).toBe('user');
    expect(turn.assistant_message.role).toBe('assistant');

    const voiceTurn = await sendMessage(
      fetchImpl,
      ACCESS,
      CONV_ID,
      'transkrip final',
      'voice'
    );
    expect(voiceTurn.user_message.modality).toBe('voice');

    const token = await fetchLivekitToken(fetchImpl, ACCESS, CONV_ID);
    expect(token.roomName).toBe(`andora-${CONV_ID}`);
    expect(token.serverUrl).toMatch(/^wss?:\/\//);
    expect(token.participantToken).not.toBe('');

    // Every authenticated call carried the Bearer header.
    const authed = log.filter((c) => !c.url.endsWith('/health'));
    expect(authed.length).toBeGreaterThan(0);
    for (const call of authed) {
      expect((call.init?.headers as Record<string, string>).Authorization).toBe(
        `Bearer ${ACCESS}`
      );
    }
  });

  it('rejects invalid tokens with 401', async () => {
    const log: LoggedCall[] = [];
    await expect(
      listConversations(stubFetch(log), 'bad-token')
    ).rejects.toMatchObject({ status: 401 });
  });
});
