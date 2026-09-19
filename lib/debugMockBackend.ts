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
export const DEBUG_USER_EMAIL = 'rizky.pratama@gmail.com';
export const DEBUG_USER_NAME = 'Rizky Pratama';
export const DEBUG_USER_PHONE = '+62 812-3456-7890';
export const DEBUG_USER_ADDRESS = 'Jl. Pahlawan No. 17, Samarinda, Kalimantan Timur';

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

const CONV_TANYA_BEASISWA = 'debug-conv-tanya-beasiswa';
const CONV_TEMPLATE_DOKUMEN = 'debug-conv-template-dokumen';
const CONV_KIRIM_WHATSAPP = 'debug-conv-kirim-whatsapp';

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
  // Scenario 1: casual Q&A about Beasiswa Kaltim Tuntas.
  store.set(CONV_TANYA_BEASISWA, {
    ...conv(
      CONV_TANYA_BEASISWA,
      'Tanya Beasiswa Kaltim Tuntas',
      'Andora: Pendaftarannya dibuka tiap awal tahun ajaran...',
      t1
    ),
    messages: [
      msg(
        CONV_TANYA_BEASISWA,
        'user',
        'Halo Andora, Beasiswa Kaltim Tuntas itu apa sih?',
        'text'
      ),
      msg(
        CONV_TANYA_BEASISWA,
        'assistant',
        'Halo Rizky! Beasiswa Kaltim Tuntas adalah program bantuan pendidikan dari Pemprov Kalimantan Timur untuk pelajar dan mahasiswa asal Kaltim. Ada dua jalur utama: Beasiswa Tuntas untuk mahasiswa aktif berprestasi, dan Beasiswa Stimulan untuk pelajar SMA/sederajat serta mahasiswa baru.',
        'text'
      ),
      msg(
        CONV_TANYA_BEASISWA,
        'user',
        'Syarat daftar yang jalur Tuntas apa saja?',
        'text'
      ),
      msg(
        CONV_TANYA_BEASISWA,
        'assistant',
        'Untuk jalur Tuntas: (1) KTP/KK Kaltim, (2) terdaftar aktif di kampus minimal semester 2 dengan IPK minimal 3,00, (3) tidak sedang menerima beasiswa lain, (4) surat pernyataan bermeterai, dan (5) transkrip nilai terakhir. Pendaftarannya dibuka tiap awal tahun ajaran lewat portal resmi. Mau saya bantu siapkan surat pernyataannya?',
        'text'
      ),
    ],
  });
  // Scenario 2: offered a document template, result file card appears.
  store.set(CONV_TEMPLATE_DOKUMEN, {
    ...conv(
      CONV_TEMPLATE_DOKUMEN,
      'Template Surat Pernyataan Beasiswa',
      'Andora: Template surat pernyataannya sudah jadi...',
      t2
    ),
    messages: [
      msg(
        CONV_TEMPLATE_DOKUMEN,
        'user',
        'Saya mau daftar Beasiswa Kaltim Tuntas jalur Tuntas. Bisa dibuatkan surat pernyataannya?',
        'text'
      ),
      msg(
        CONV_TEMPLATE_DOKUMEN,
        'assistant',
        'Bisa. Saya buatkan template Surat Pernyataan Pendaftar Beasiswa Kaltim Tuntas atas nama Rizky Pratama, NIM 2009106011, Universitas Mulawarman, Fakultas Ilmu Komputer, Jurusan Informatika. Datanya saya ambil dari profil kamu. Saya proses sekarang ya.',
        'text'
      ),
      msg(
        CONV_TEMPLATE_DOKUMEN,
        'assistant',
        'Template surat pernyataannya sudah jadi dalam format PDF. Silakan periksa di kartu dokumen di bawah, lalu unduh atau langsung kirim via WhatsApp.',
        'text'
      ),
    ],
  });
  // Scenario 3: send the finished PDF via WhatsApp intent.
  store.set(CONV_KIRIM_WHATSAPP, {
    ...conv(
      CONV_KIRIM_WHATSAPP,
      'Kirim Surat via WhatsApp',
      'Andora: WhatsApp akan terbuka dengan dokumen terlampir...',
      t3
    ),
    messages: [
      msg(
        CONV_KIRIM_WHATSAPP,
        'user',
        'Kirim surat pernyataannya ke WhatsApp saya 081234567890.',
        'voice'
      ),
      msg(
        CONV_KIRIM_WHATSAPP,
        'assistant',
        'Siap. Saya siapkan PDF surat pernyataannya, lalu WhatsApp akan terbuka dengan dokumen terlampir ke nomor 081234567890. Kamu tinggal tekan kirim di WhatsApp.',
        'voice'
      ),
    ],
  });
}

export function mockAssistantReply(content: string): string {
  const text = content.toLowerCase();
  if (text.includes('kirim') && text.includes('whatsapp')) {
    return 'Siap. Saya siapkan PDF-nya, lalu WhatsApp akan terbuka dengan dokumen terlampir. Kamu tinggal tekan kirim di WhatsApp.';
  }
  if (text.includes('template') || text.includes('buatkan surat') || text.includes('dibuatkan surat')) {
    return 'Bisa. Saya buatkan template Surat Pernyataan Pendaftar Beasiswa Kaltim Tuntas atas nama kamu. Saya proses sekarang ya, hasilnya muncul sebagai kartu dokumen di bawah.';
  }
  if (text.includes('syarat') || text.includes('daftar')) {
    return 'Untuk jalur Tuntas: (1) KTP/KK Kaltim, (2) mahasiswa aktif minimal semester 2 dengan IPK minimal 3,00, (3) tidak sedang menerima beasiswa lain, (4) surat pernyataan bermeterai, dan (5) transkrip nilai terakhir. Mau saya bantu siapkan surat pernyataannya?';
  }
  if (text.includes('kaltim tuntas') || text.includes('beasiswa')) {
    return 'Beasiswa Kaltim Tuntas adalah program bantuan pendidikan dari Pemprov Kalimantan Timur untuk pelajar dan mahasiswa asal Kaltim. Ada dua jalur: Beasiswa Tuntas untuk mahasiswa aktif berprestasi, dan Beasiswa Stimulan untuk pelajar dan mahasiswa baru. Kamu mau tanya syaratnya atau langsung saya buatkan surat pernyataannya?';
  }
  if (text.includes('surat') || text.includes('dokumen')) {
    return 'Saya catat kebutuhan suratnya. Dokumen apa yang ingin dibuat lebih dulu?';
  }
  if (/(halo|hallo|hai|pagi|siang|sore|malam)/.test(text)) {
    return 'Halo, saya Andora. Ada yang bisa saya bantu untuk mengurus dokumen, misalnya info Beasiswa Kaltim Tuntas?';
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
): AndoraLivekitToken {  const roomName = roomNameForConversation(conversationId);
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

// Scenario documents shown in demo mode: a finished random PDF plus the
// WhatsApp intent payload the worker would emit for scenario 3.
export interface DebugScenarioDocument {
  conversationId: string;
  namaDokumen: string;
  fileName: string;
  url: string;
}

export interface DebugScenarioIntent {
  conversationId: string;
  phoneNumber: string;
  fileUrl: string;
  fileName: string;
  caption: string;
}

export function debugScenarioDocuments(): DebugScenarioDocument[] {
  return [
    {
      conversationId: CONV_TEMPLATE_DOKUMEN,
      namaDokumen: 'Surat Pernyataan Pendaftar Beasiswa Kaltim Tuntas',
      fileName: 'surat-pernyataan-beasiswa-kaltim-tuntas.pdf',
      url: 'https://storage.andora.local/surat-pernyataan-beasiswa-kaltim-tuntas.pdf',
    },
  ];
}

export function debugScenarioIntent(): DebugScenarioIntent {
  const doc = debugScenarioDocuments()[0];
  return {
    conversationId: CONV_KIRIM_WHATSAPP,
    phoneNumber: '6281234567890',
    fileUrl: doc?.url ?? '',
    fileName: doc?.fileName ?? '',
    caption: 'Surat Pernyataan Pendaftar Beasiswa Kaltim Tuntas dari Andora',
  };
}

export function debugScenarioConversationIds(): {
  tanya: string;
  template: string;
  kirim: string;
} {
  return {
    tanya: CONV_TANYA_BEASISWA,
    template: CONV_TEMPLATE_DOKUMEN,
    kirim: CONV_KIRIM_WHATSAPP,
  };
}
