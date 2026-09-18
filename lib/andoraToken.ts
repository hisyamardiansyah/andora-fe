import type { TokenSourceResponseObject } from 'livekit-client';

// Backend contract (andora-be POST /livekit/token):
// { server_url, participant_token, room_name, conversation_id }
// room_name must equal `andora-{conversation_id}`.

export const ANDORA_ROOM_PREFIX = 'andora-';

export interface AndoraLivekitToken {
  serverUrl: string;
  participantToken: string;
  roomName: string;
  conversationId: string;
}

export function roomNameForConversation(conversationId: string): string {
  return `${ANDORA_ROOM_PREFIX}${conversationId}`;
}

export const ANDORA_RPC_MIC_HOLD = 'andora.mic.hold';
export const ANDORA_RPC_MIC_RELEASE = 'andora.mic.release';
export const ANDORA_TURN_COMPLETED_TOPIC = 'andora.turn.completed';
export const ANDORA_TURN_READY_TOPIC = 'andora.turn.ready';
export const ANDORA_TURN_FAILED_TOPIC = 'andora.turn.failed';

export type AndoraTurnStatus =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'ready'
  | 'failed';

// Maps backend andora.turn.* data packets to small UI states.
export function reduceTurnEvent(
  topic: string,
  data: unknown
): { status: AndoraTurnStatus; fetchRequired: boolean; reason?: string } {
  const record = (data ?? {}) as Record<string, unknown>;
  const type = typeof record.type === 'string' ? record.type : undefined;
  if (topic === ANDORA_TURN_COMPLETED_TOPIC) {
    return {
      status: 'processing',
      fetchRequired: type === 'andora.turn.completed.fetch_required',
    };
  }
  if (topic === ANDORA_TURN_READY_TOPIC) {
    const reason =
      typeof record.reason === 'string' ? record.reason : undefined;
    return { status: 'ready', fetchRequired: false, reason };
  }
  if (topic === ANDORA_TURN_FAILED_TOPIC) {
    return { status: 'failed', fetchRequired: false };
  }
  return { status: 'idle', fetchRequired: false };
}

export function parseRpcResponse(raw: string): {
  status: string;
  state?: string;
} {
  const record = JSON.parse(raw) as Record<string, unknown>;
  const status = typeof record.status === 'string' ? record.status : 'unknown';
  const state = typeof record.state === 'string' ? record.state : undefined;
  return { status, state };
}

export function authHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

export function parseAndoraTokenResponse(
  data: unknown
): TokenSourceResponseObject {
  const record = (data ?? {}) as Record<string, unknown>;
  const serverUrl =
    record.serverUrl ??
    record.server_url ??
    record.ws_url ??
    record.url ??
    record.livekitUrl;
  const participantToken =
    record.participantToken ??
    record.participant_token ??
    record.token ??
    record.accessToken;
  if (
    typeof serverUrl !== 'string' ||
    !serverUrl ||
    typeof participantToken !== 'string' ||
    !participantToken
  ) {
    throw new Error('Andora token response missing serverUrl/participantToken');
  }
  return { serverUrl, participantToken };
}

export function parseAndoraLivekitToken(data: unknown): AndoraLivekitToken {
  const base = parseAndoraTokenResponse(data);
  const record = (data ?? {}) as Record<string, unknown>;
  const roomName = record.roomName ?? record.room_name;
  const conversationId = record.conversationId ?? record.conversation_id;
  if (
    typeof roomName !== 'string' ||
    !roomName ||
    typeof conversationId !== 'string' ||
    !conversationId
  ) {
    throw new Error('Andora token response missing room_name/conversation_id');
  }
  const expected = roomNameForConversation(conversationId);
  if (roomName !== expected) {
    throw new Error(
      `Andora token room mismatch: got ${roomName}, want ${expected}`
    );
  }
  return {
    serverUrl: base.serverUrl,
    participantToken: base.participantToken,
    roomName,
    conversationId,
  };
}
