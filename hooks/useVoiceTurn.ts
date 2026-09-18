// Push-to-talk voice turn against the andora-be LiveKit worker.
// RPC andora.mic.hold/release goes to the real worker participant identity
// discovered from room participants; andora.turn.* data packets drive status.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import {
  ANDORA_RPC_MIC_HOLD,
  ANDORA_RPC_MIC_RELEASE,
  ANDORA_TURN_COMPLETED_TOPIC,
  ANDORA_TURN_FAILED_TOPIC,
  ANDORA_TURN_READY_TOPIC,
  parseRpcResponse,
  reduceTurnEvent,
} from '@/lib/andoraToken';
import type { AndoraTurnStatus } from '@/lib/andoraToken';

export interface VoiceTurnMessage {
  id: string;
  content: string;
  conversationId: string;
}

export interface VoiceTurnHandlers {
  onUserMessage?: (msg: VoiceTurnMessage) => void;
  onAssistantMessage?: (msg: VoiceTurnMessage) => void;
  onFetchRequired?: (conversationId: string) => void;
  onReady?: (conversationId: string, reason?: string) => void;
  onFailed?: (conversationId: string) => void;
}

function decodePayload(payload: Uint8Array): unknown {
  try {
    const text = new TextDecoder().decode(payload);
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function messageContent(value: unknown): string | null {
  const record = (value ?? {}) as Record<string, unknown>;
  return typeof record.content === 'string' ? record.content : null;
}

function messageId(value: unknown, fallback: string): string {
  const record = (value ?? {}) as Record<string, unknown>;
  return typeof record.id === 'string' && record.id ? record.id : fallback;
}

function conversationOf(value: unknown): string {
  const record = (value ?? {}) as Record<string, unknown>;
  return typeof record.conversation_id === 'string'
    ? record.conversation_id
    : '';
}

export function useVoiceTurn(
  room: Room | undefined,
  handlers: VoiceTurnHandlers = {}
): {
  status: AndoraTurnStatus;
  workerIdentity: string | null;
  rpcError: string | null;
  holdToTalk: () => Promise<void>;
  releaseToSend: () => Promise<void>;
} {
  const [status, setStatus] = useState<AndoraTurnStatus>('idle');
  const [workerIdentity, setWorkerIdentity] = useState<string | null>(null);
  const [rpcError, setRpcError] = useState<string | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const refreshWorker = useCallback(() => {
    if (!room) {
      setWorkerIdentity(null);
      return;
    }
    const remote = Array.from(room.remoteParticipants.keys());
    const localIdentity = room.localParticipant?.identity;
    const worker =
      remote.find((identity) => identity !== localIdentity) ?? null;
    setWorkerIdentity(worker);
  }, [room]);

  useEffect(() => {
    if (!room) return;
    refreshWorker();
    const onData = (
      payload: Uint8Array,
      _participant?: unknown,
      _kind?: unknown,
      topic?: string
    ) => {
      if (
        topic !== ANDORA_TURN_COMPLETED_TOPIC &&
        topic !== ANDORA_TURN_READY_TOPIC &&
        topic !== ANDORA_TURN_FAILED_TOPIC
      ) {
        return;
      }
      const data = decodePayload(payload);
      const reduced = reduceTurnEvent(topic, data);
      if (topic === ANDORA_TURN_COMPLETED_TOPIC) {
        if (reduced.fetchRequired) {
          setStatus('processing');
          const conversationId = conversationOf(data);
          if (conversationId) {
            handlersRef.current.onFetchRequired?.(conversationId);
          }
          return;
        }
        setStatus('processing');
        const record = (data ?? {}) as Record<string, unknown>;
        const conversationId = conversationOf(data);
        const userContent = messageContent(record.user_message);
        const assistantContent = messageContent(record.assistant_message);
        if (userContent) {
          handlersRef.current.onUserMessage?.({
            id: messageId(record.user_message, `voice-user-${Date.now()}`),
            content: userContent,
            conversationId,
          });
        }
        if (assistantContent) {
          handlersRef.current.onAssistantMessage?.({
            id: messageId(
              record.assistant_message,
              `voice-assistant-${Date.now()}`
            ),
            content: assistantContent,
            conversationId,
          });
        }
        return;
      }
      if (topic === ANDORA_TURN_READY_TOPIC) {
        setStatus('ready');
        const conversationId = conversationOf(data);
        handlersRef.current.onReady?.(conversationId, reduced.reason);
        return;
      }
      setStatus('failed');
      handlersRef.current.onFailed?.(conversationOf(data));
    };
    const onParticipants = () => refreshWorker();
    room.on(RoomEvent.DataReceived, onData);
    room.on(RoomEvent.ParticipantConnected, onParticipants);
    room.on(RoomEvent.ParticipantDisconnected, onParticipants);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
      room.off(RoomEvent.ParticipantConnected, onParticipants);
      room.off(RoomEvent.ParticipantDisconnected, onParticipants);
    };
  }, [room, refreshWorker]);

  const holdToTalk = useCallback(async () => {
    setRpcError(null);
    if (!room) {
      throw new Error('Ruang suara belum tersambung');
    }
    if (!workerIdentity) {
      throw new Error('Worker suara belum bergabung. Tunggu sebentar.');
    }
    const raw = await room.localParticipant.performRpc({
      destinationIdentity: workerIdentity,
      method: ANDORA_RPC_MIC_HOLD,
      payload: '{}',
    });
    const { status: rpcStatus } = parseRpcResponse(raw);
    if (rpcStatus === 'unauthorized') {
      throw new Error('Tidak diizinkan memakai mic ruangan ini');
    }
    setStatus(rpcStatus === 'busy' ? 'processing' : 'recording');
  }, [room, workerIdentity]);

  const releaseToSend = useCallback(async () => {
    setRpcError(null);
    if (!room) {
      throw new Error('Ruang suara belum tersambung');
    }
    if (!workerIdentity) {
      throw new Error('Worker suara belum bergabung. Tunggu sebentar.');
    }
    const raw = await room.localParticipant.performRpc({
      destinationIdentity: workerIdentity,
      method: ANDORA_RPC_MIC_RELEASE,
      payload: '{}',
    });
    const { status: rpcStatus } = parseRpcResponse(raw);
    if (rpcStatus === 'unauthorized') {
      throw new Error('Tidak diizinkan memakai mic ruangan ini');
    }
    setStatus('processing');
  }, [room, workerIdentity]);

  return useMemo(
    () => ({ status, workerIdentity, rpcError, holdToTalk, releaseToSend }),
    [status, workerIdentity, rpcError, holdToTalk, releaseToSend]
  );
}
