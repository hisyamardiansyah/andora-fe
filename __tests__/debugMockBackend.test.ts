// Behavior tests for the shipped debug dummy backend.
import {
  DEBUG_USER_ID,
  debugCreateConversation,
  debugFetchLivekitToken,
  debugGetConversationDetail,
  debugListConversations,
  debugScenarioConversationIds,
  debugScenarioDocuments,
  debugScenarioIntent,
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
  it('seeds the three beasiswa demo scenarios with history', () => {
    const ids = debugScenarioConversationIds();
    const items = debugListConversations();
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items[0]?.user_id).toBe(DEBUG_USER_ID);
    for (const id of [ids.tanya, ids.template, ids.kirim]) {
      expect(debugGetConversationDetail(id).messages.length).toBeGreaterThan(
        0
      );
    }
  });

  it('searches titles and message content', () => {
    const found = debugListConversations('beasiswa');
    expect(found.length).toBeGreaterThan(0);
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
    const ids = debugScenarioConversationIds();
    const token = debugFetchLivekitToken(ids.tanya);
    expect(token.roomName).toBe(`andora-${ids.tanya}`);
    expect(token.serverUrl).toMatch(/^wss?:\/\//);
    expect(token.participantToken).not.toBe('');
    expect(debugUploadDocument(token.roomName).roomName).toBe(token.roomName);
    expect(() => debugGetConversationDetail('missing')).toThrow(
      /tidak ditemukan/
    );
  });

  it('exposes the beasiswa template doc and whatsapp intent', () => {
    const ids = debugScenarioConversationIds();
    const docs = debugScenarioDocuments();
    expect(docs).toHaveLength(1);
    expect(docs[0]?.conversationId).toBe(ids.template);
    expect(docs[0]?.fileName.endsWith('.pdf')).toBe(true);
    const intent = debugScenarioIntent();
    expect(intent.conversationId).toBe(ids.kirim);
    expect(intent.fileUrl).toBe(docs[0]?.url);
    expect(intent.caption).toMatch(/Kaltim Tuntas/);
  });
});
