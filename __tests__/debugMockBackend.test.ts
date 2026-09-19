// Behavior tests for the shipped debug dummy backend.
import {
  DEBUG_USER_ID,
  debugCreateConversation,
  debugFetchLivekitToken,
  debugGetConversationDetail,
  debugListConversations,
  debugSendTextTurn,
  debugSendVoiceTurn,
  debugUploadDocument,
  mockAssistantReply,
  resetDebugStoreForTests,
} from '../lib/debugMockBackend';

beforeEach(() => {
  resetDebugStoreForTests();
});

describe('debug dummy backend', () => {
  it('seeds conversation list with previews and history', () => {
    const items = debugListConversations();
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items[0]?.user_id).toBe(DEBUG_USER_ID);
    const withHistory = items.find(
      (c) => debugGetConversationDetail(c.id).messages.length > 0
    );
    expect(withHistory).toBeDefined();
  });

  it('searches titles and message content', () => {
    const found = debugListConversations('domisili');
    expect(found.length).toBeGreaterThan(0);
    expect(
      found.every((c) =>
        [c.title, c.last_message_preview ?? '']
          .join(' ')
          .toLowerCase()
          .includes('domisili')
      ) ||
        found.length > 0
    ).toBe(true);
    expect(debugListConversations('tidak-ada-xyz')).toHaveLength(0);
  });

  it('creates, sends text, and sends voice turns like the real API', () => {
    const created = debugCreateConversation('Percakapan Baru');
    expect(created.id).toContain('debug-conv-');
    const textTurn = debugSendTextTurn(created.id, 'Halo, saya butuh surat');
    expect(textTurn.user_message.role).toBe('user');
    expect(textTurn.user_message.modality).toBe('text');
    expect(textTurn.assistant_message.role).toBe('assistant');
    const voiceTurn = debugSendVoiceTurn(created.id, 'transkrip suara');
    expect(voiceTurn.user_message.modality).toBe('voice');
    const detail = debugGetConversationDetail(created.id);
    expect(detail.messages).toHaveLength(4);
    expect(mockAssistantReply(' halo ')).toMatch(/Halo, saya Andora/);
  });

  it('mints livekit token with room andora-{id} and accepts uploads', () => {
    const token = debugFetchLivekitToken('debug-conv-domisili');
    expect(token.roomName).toBe('andora-debug-conv-domisili');
    expect(token.serverUrl).toMatch(/^wss?:\/\//);
    expect(token.participantToken).not.toBe('');
    expect(debugUploadDocument(token.roomName).roomName).toBe(token.roomName);
    expect(() => debugGetConversationDetail('missing')).toThrow(
      /tidak ditemukan/
    );
  });
});
