// In-memory dummy backend for debug mode (no live andora-be).
// Shapes mirror app/schemas.py + ANDORA.postman_collection.json so the
// workflow looks like the real thing: list/search/detail/create,
// text + voice turns, LiveKit token with room andora-{id}, and upload.
import type {
  AndoraChatTurn,
  AndoraConversation,
  AndoraConversationDetail,
  AndoraMessage,
} from './andoraApi';
import type { AndoraLivekitToken } from './andoraToken';
import { roomNameForConversation } from './andoraToken';

export const DEBUG_ACCESS_TOKEN = 'debug-access-token';
export const DEBUG_USER_ID = 'debug-user-1';
export const DEBUG_USER_EMAIL = 'debug@andora.id';
export const DEBUG_USER_NAME = 'Pengguna Debug';
export const DEBUG_USER_PHONE = '+62 812-3456-7890';
export const DEBUG_USER_ADDRESS = 'Jl. Merdeka No. 17, Samarinda';

let msgCounter = 100;

function now(): string {
  return new Date().toISOString();
}

function msg(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  modality: 'text' | 'voice'
): AndoraMessage {
  msgCounter += 1;
  return {
    id: `debug-msg-${msgCounter}`,
    conversation_id: conversationId,
    role,
    content,
    modality,
    created_at: now(),
  };
}

function conv(
  id: string,
  title: string,
  preview: string | null,
  createdAt: string
): AndoraConversation {
  return {
    id,
    user_id: DEBUG_USER_ID,
    title,
    last_message_preview: preview,
    last_message_at: preview ? createdAt : null,
    created_at: createdAt,
    updated_at: createdAt,
  };
}

const CONV_DOMISILI = 'debug-conv-domisili';
const CONV_BEASISWA = 'debug-conv-beasiswa';
const CONV_KTP = 'debug-conv-ktp';

const store: Map<string, AndoraConversationDetail> = new Map();

// Exposed only for tests: clears the seed so each test file starts fresh.
export function resetDebugStoreForTests(): void {
  store.clear();
  msgCounter = 100;
}

function seed(): void {
  if (store.size > 0) return;
  const t1 = '2026-09-18T10:00:00+00:00';
  const t2 = '2026-09-18T11:00:00+00:00';
  const t3 = '2026-09-18T12:00:00+00:00';
  store.set(CONV_DOMISILI, {
    ...conv(
      CONV_DOMISILI,
      'Surat Keterangan Domisili',
      'Andora: Baik. Surat domisilinya untuk keperluan apa?',
      t1
    ),
    messages: [
      msg(
        CONV_DOMISILI,
        'user',
        'Halo Andora, saya ingin mengurus surat keterangan domisili.',
        'text'
      ),
      msg(
        CONV_DOMISILI,
        'assistant',
        'Baik. Surat domisilinya untuk keperluan apa? Siapkan KTP dan kartu keluarga.',
        'text'
      ),
    ],
  });
  store.set(CONV_BEASISWA, {
    ...conv(
      CONV_BEASISWA,
      'Surat Pernyataan Beasiswa',
      'Andora: Dokumen beasiswanya sudah saya siapkan.',
      t2
    ),
    messages: [
      msg(
        CONV_BEASISWA,
        'user',
        'Tolong buatkan surat pernyataan beasiswa.',
        'voice'
      ),
      msg(
        CONV_BEASISWA,
        'assistant',
        'Dokumen beasiswanya sudah saya siapkan. Mau saya kirim via WhatsApp?',
        'voice'
      ),
    ],
  });
  store.set(CONV_KTP, {
    ...conv(CONV_KTP, 'Percakapan Baru', null, t3),
    messages: [],
  });
}

export function mockAssistantReply(content: string): string {
  const text = content.toLowerCase();
  if (text.includes('domisili')) {
    return 'Baik. Surat domisilinya untuk keperluan apa? Siapkan KTP dan kartu keluarga.';
  }
  if (text.includes('beasiswa')) {
    return 'Siap. Data nama, NIM, dan universitasnya apa? Saya siapkan surat pernyataannya.';
  }
  if (text.includes('surat') || text.includes('dokumen')) {
    return 'Saya catat kebutuhan suratnya. Dokumen apa yang ingin dibuat lebih dulu?';
  }
  if (/(halo|hallo|hai|pagi|siang|sore|malam)/.test(text)) {
    return 'Halo, saya Andora. Ada yang bisa saya bantu untuk mengurus dokumen?';
  }
  return `Saya catat: "${content}". Mau dilanjutkan ke pembuatan surat?`;
}

function appendTurn(
  conversationId: string,
  content: string,
  modality: 'text' | 'voice'
): AndoraChatTurn {
  seed();
  const detail = store.get(conversationId);
  if (!detail) {
    throw new Error('Conversation tidak ditemukan');
  }
  const userMessage = msg(conversationId, 'user', content, modality);
  const assistantMessage = msg(
    conversationId,
    'assistant',
    mockAssistantReply(content),
    modality
  );
  const updated: AndoraConversationDetail = {
    ...detail,
    messages: [...detail.messages, userMessage, assistantMessage],
    last_message_preview: `Andora: ${assistantMessage.content.slice(0, 80)}`,
    last_message_at: assistantMessage.created_at,
    updated_at: assistantMessage.created_at,
  };
  store.set(conversationId, updated);
  return {
    conversation_id: conversationId,
    user_message: userMessage,
    assistant_message: assistantMessage,
  };
}

export function debugListConversations(search?: string): AndoraConversation[] {
  seed();
  const all = [...store.values()]
    .map(({ messages, ...rest }) => rest)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  const query = search?.trim().toLowerCase();
  if (!query) return all;
  return all.filter((c) => {
    const detail = store.get(c.id);
    const haystack = [
      c.title,
      c.last_message_preview ?? '',
      ...(detail?.messages.map((m) => m.content) ?? []),
    ]
      .join('\n')
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function debugCreateConversation(title?: string): AndoraConversation {
  seed();
  const id = `debug-conv-${Date.now()}`;
  const detail: AndoraConversationDetail = {
    ...conv(id, title?.trim() || 'Percakapan Baru', null, now()),
    messages: [],
  };
  store.set(id, detail);
  const { messages, ...rest } = detail;
  void messages;
  return rest;
}

export function debugGetConversationDetail(
  conversationId: string
): AndoraConversationDetail {
  seed();
  const detail = store.get(conversationId);
  if (!detail) {
    throw new Error('Conversation tidak ditemukan');
  }
  return { ...detail, messages: [...detail.messages] };
}

export function debugSendTextTurn(
  conversationId: string,
  content: string
): AndoraChatTurn {
  const text = content.trim();
  if (!text) {
    throw new Error('Pesan kosong');
  }
  return appendTurn(conversationId, text, 'text');
}

export function debugSendVoiceTurn(
  conversationId: string,
  transcript: string
): AndoraChatTurn {
  const text = transcript.trim();
  if (!text) {
    throw new Error('Transkrip suara kosong');
  }
  return appendTurn(conversationId, text, 'voice');
}

export function debugFetchLivekitToken(
  conversationId: string
): AndoraLivekitToken {
  const roomName = roomNameForConversation(conversationId);
  return {
    serverUrl: 'wss://debug-livekit.andora.local',
    participantToken: `debug-participant-token-${conversationId}`,
    roomName,
    conversationId,
  };
}

export function debugUploadDocument(roomName: string): { roomName: string } {
  const name = roomName.trim();
  if (!name) {
    throw new Error('Room belum dipilih.');
  }
  return { roomName: name };
}
