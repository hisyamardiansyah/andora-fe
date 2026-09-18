// Pure client + parsers for the new andora-be document flow.
// POST /api/documents/upload accepts multipart form { room_name, file }
// and stores {room_name}_latest.pdf. The voice worker later emits:
// - { event: DOCUMENT_READY, nama_dokumen, url }
// - { action: OPEN_WHATSAPP_INTENT, payload: { phone_number, file_url, file_name, caption } }
import { andoraApiBaseUrl } from './andoraApi';
import type { FetchLike } from './andoraApi';
import { roomNameForConversation } from './andoraToken';

export const DOCUMENT_UPLOAD_PATH = '/api/documents/upload';
export const DOCUMENT_READY_EVENT = 'DOCUMENT_READY';
export const WHATSAPP_INTENT_ACTION = 'OPEN_WHATSAPP_INTENT';

export interface DocumentReadySignal {
  namaDokumen: string;
  url: string;
}

export interface WhatsAppIntentSignal {
  phoneNumber: string;
  fileUrl: string;
  fileName: string;
  caption?: string;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

export function parseDocumentReady(data: unknown): DocumentReadySignal | null {
  const record = (data ?? {}) as Record<string, unknown>;
  if (record.event !== DOCUMENT_READY_EVENT) return null;
  const namaDokumen = text(record.nama_dokumen) ?? text(record.namaDokumen);
  const url = text(record.url);
  if (!namaDokumen || !url) return null;
  return { namaDokumen, url };
}

export function parseWhatsAppIntent(data: unknown): WhatsAppIntentSignal | null {
  const record = (data ?? {}) as Record<string, unknown>;
  if (record.action !== WHATSAPP_INTENT_ACTION) return null;
  const payload = (record.payload ?? {}) as Record<string, unknown>;
  const phoneNumber =
    text(payload.phone_number) ?? text(payload.phoneNumber);
  const fileUrl = text(payload.file_url) ?? text(payload.fileUrl);
  const fileName = text(payload.file_name) ?? text(payload.fileName);
  if (!phoneNumber || !fileUrl || !fileName) return null;
  const caption = text(payload.caption) ?? undefined;
  return { phoneNumber, fileUrl, fileName, caption };
}

export async function uploadDocumentForConversation(
  fetchImpl: FetchLike,
  accessToken: string,
  conversationId: string,
  file: { uri: string; name: string; mimeType?: string }
): Promise<{ roomName: string }> {
  const trimmed = conversationId.trim();
  if (!trimmed) {
    throw new Error('Conversation belum dipilih.');
  }
  const roomName = roomNameForConversation(trimmed);
  const base = andoraApiBaseUrl();
  const form = new FormData();
  form.append('room_name', roomName);
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/pdf',
  } as unknown as Blob);
  const res = await fetchImpl(`${base}${DOCUMENT_UPLOAD_PATH}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form as unknown as BodyInit,
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const detail =
      (data as { detail?: unknown; message?: unknown } | null)?.detail ??
      (data as { message?: unknown } | null)?.message ??
      `HTTP ${res.status}`;
    throw new Error(
      typeof detail === 'string' ? detail : JSON.stringify(detail)
    );
  }
  return { roomName };
}
