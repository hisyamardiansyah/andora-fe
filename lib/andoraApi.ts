// Pure REST client for andora-be (FastAPI).
// Shapes mirror app/schemas.py + ANDORA.postman_collection.json.
import { authHeaders, parseAndoraLivekitToken } from './andoraToken';
import type { AndoraLivekitToken } from './andoraToken';

export type FetchLike = (
  url: string,
  init?: RequestInit
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export interface AndoraMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  modality: string;
  created_at: string;
}

export interface AndoraConversation {
  id: string;
  user_id: string;
  title: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AndoraConversationDetail extends AndoraConversation {
  messages: AndoraMessage[];
}

export interface AndoraChatTurn {
  conversation_id: string;
  user_message: AndoraMessage;
  assistant_message: AndoraMessage;
}

export class AndoraApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function andoraApiBaseUrl(): string {
  const base =
    process.env.EXPO_PUBLIC_ANDORA_API_URL ??
    process.env.EXPO_PUBLIC_ANDORA_TOKEN_URL?.replace(/\/token\/?$/, '');
  if (!base) {
    throw new Error(
      'Backend andora-be belum dikonfigurasi. Isi EXPO_PUBLIC_ANDORA_API_URL.'
    );
  }
  return base.replace(/\/$/, '');
}

async function requestJson<T>(
  fetchImpl: FetchLike,
  method: string,
  path: string,
  accessToken: string,
  body?: unknown
): Promise<T> {
  const base = andoraApiBaseUrl();
  const res = await fetchImpl(`${base}${path}`, {
    method,
    headers: {
      ...authHeaders(accessToken),
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const detail =
      (data as { detail?: unknown } | null)?.detail ?? `HTTP ${res.status}`;
    throw new AndoraApiError(
      res.status,
      typeof detail === 'string' ? detail : JSON.stringify(detail)
    );
  }
  return data as T;
}

function assertConversation(data: unknown): AndoraConversation {
  const c = data as AndoraConversation;
  if (!c || typeof c.id !== 'string' || typeof c.title !== 'string') {
    throw new Error('Respons conversation backend tidak valid');
  }
  return c;
}

export async function createConversation(
  fetchImpl: FetchLike,
  accessToken: string,
  title?: string
): Promise<AndoraConversation> {
  const data = await requestJson<unknown>(
    fetchImpl,
    'POST',
    '/conversations',
    accessToken,
    title ? { title } : {}
  );
  return assertConversation(data);
}

export async function listConversations(
  fetchImpl: FetchLike,
  accessToken: string,
  search?: string
): Promise<AndoraConversation[]> {
  const path =
    search && search.trim()
      ? `/conversations?search=${encodeURIComponent(search.trim())}`
      : '/conversations';
  const data = await requestJson<unknown>(fetchImpl, 'GET', path, accessToken);
  if (!Array.isArray(data)) {
    throw new Error('Respons daftar conversation backend tidak valid');
  }
  return data.map(assertConversation);
}

export async function getConversationDetail(
  fetchImpl: FetchLike,
  accessToken: string,
  conversationId: string
): Promise<AndoraConversationDetail> {
  const data = await requestJson<unknown>(
    fetchImpl,
    'GET',
    `/conversations/${encodeURIComponent(conversationId)}`,
    accessToken
  );
  const detail = assertConversation(data) as AndoraConversationDetail;
  if (!Array.isArray(detail.messages)) {
    throw new Error('Respons detail conversation backend tidak valid');
  }
  return detail;
}

export async function sendMessage(
  fetchImpl: FetchLike,
  accessToken: string,
  conversationId: string,
  content: string,
  modality: 'text' | 'voice' = 'text'
): Promise<AndoraChatTurn> {
  const data = await requestJson<unknown>(
    fetchImpl,
    'POST',
    `/conversations/${encodeURIComponent(conversationId)}/messages`,
    accessToken,
    { content, modality }
  );
  const turn = data as AndoraChatTurn;
  if (
    !turn ||
    turn.user_message?.role !== 'user' ||
    turn.assistant_message?.role !== 'assistant'
  ) {
    throw new Error('Respons pesan backend tidak valid');
  }
  return turn;
}

export async function fetchLivekitToken(
  fetchImpl: FetchLike,
  accessToken: string,
  conversationId: string
): Promise<AndoraLivekitToken> {
  const data = await requestJson<unknown>(
    fetchImpl,
    'POST',
    '/livekit/token',
    accessToken,
    { conversation_id: conversationId }
  );
  return parseAndoraLivekitToken(data);
}

export async function checkHealth(
  fetchImpl: FetchLike
): Promise<{ status: string }> {
  const base = andoraApiBaseUrl();
  const res = await fetchImpl(`${base}/health`);
  const data = (await res.json()) as { status?: unknown };
  if (!res.ok || data?.status !== 'ok') {
    throw new Error('Backend andora-be tidak sehat');
  }
  return { status: 'ok' };
}
