import {
  ANDORA_ROOM_PREFIX,
  authHeaders,
  parseAndoraLivekitToken,
  parseAndoraTokenResponse,
  parseRpcResponse,
  reduceTurnEvent,
  roomNameForConversation,
} from '../lib/andoraToken';

describe('roomNameForConversation', () => {
  it('returns andora-{id}', () => {
    expect(roomNameForConversation('abc123')).toBe('andora-abc123');
  });

  it('uses the ANDORA_ROOM_PREFIX', () => {
    expect(roomNameForConversation('x')).toBe(`${ANDORA_ROOM_PREFIX}x`);
  });
});

describe('authHeaders', () => {
  it('returns Authorization Bearer <token>', () => {
    expect(authHeaders('tok123')).toEqual({ Authorization: 'Bearer tok123' });
  });
});

describe('parseAndoraTokenResponse', () => {
  it('accepts camelCase serverUrl/participantToken', () => {
    expect(
      parseAndoraTokenResponse({
        serverUrl: 'wss://livekit.example.com',
        participantToken: 'ptoken',
      }),
    ).toEqual({
      serverUrl: 'wss://livekit.example.com',
      participantToken: 'ptoken',
    });
  });

  it('accepts snake_case server_url/participant_token aliases via ws_url/token', () => {
    expect(
      parseAndoraTokenResponse({
        ws_url: 'wss://livekit.example.com',
        token: 'ptoken',
      }),
    ).toEqual({
      serverUrl: 'wss://livekit.example.com',
      participantToken: 'ptoken',
    });
  });

  it('accepts url and accessToken aliases', () => {
    expect(
      parseAndoraTokenResponse({
        url: 'wss://livekit.example.com',
        accessToken: 'ptoken',
      }),
    ).toEqual({
      serverUrl: 'wss://livekit.example.com',
      participantToken: 'ptoken',
    });
  });

  it('accepts livekitUrl alias', () => {
    expect(
      parseAndoraTokenResponse({
        livekitUrl: 'wss://livekit.example.com',
        participantToken: 'ptoken',
      }),
    ).toEqual({
      serverUrl: 'wss://livekit.example.com',
      participantToken: 'ptoken',
    });
  });

  it.each([{}, null, undefined, { serverUrl: 'wss://x' }, { participantToken: 't' }])(
    'throws on missing fields: %p',
    (input) => {
      expect(() => parseAndoraTokenResponse(input)).toThrow(
        'Andora token response missing serverUrl/participantToken',
      );
    },
  );

  it('throws on empty string fields', () => {
    expect(() =>
      parseAndoraTokenResponse({ serverUrl: '', participantToken: '' }),
    ).toThrow('Andora token response missing serverUrl/participantToken');
  });
});

describe('parseAndoraLivekitToken', () => {
  it('accepts room_name=andora-{conversation_id} snake_case', () => {
    expect(
      parseAndoraLivekitToken({
        server_url: 'wss://livekit.example.com',
        ws_url: 'wss://livekit.example.com',
        participant_token: 'ptoken',
        token: 'ptoken',
        room_name: 'andora-conv123',
        conversation_id: 'conv123',
      }),
    ).toEqual({
      serverUrl: 'wss://livekit.example.com',
      participantToken: 'ptoken',
      roomName: 'andora-conv123',
      conversationId: 'conv123',
    });
  });

  it('accepts camelCase roomName/conversationId', () => {
    expect(
      parseAndoraLivekitToken({
        serverUrl: 'wss://livekit.example.com',
        participantToken: 'ptoken',
        roomName: 'andora-conv123',
        conversationId: 'conv123',
      }),
    ).toEqual({
      serverUrl: 'wss://livekit.example.com',
      participantToken: 'ptoken',
      roomName: 'andora-conv123',
      conversationId: 'conv123',
    });
  });

  it('throws on room mismatch', () => {
    expect(() =>
      parseAndoraLivekitToken({
        serverUrl: 'wss://livekit.example.com',
        participantToken: 'ptoken',
        room_name: 'andora-other',
        conversation_id: 'conv123',
      }),
    ).toThrow(/room mismatch/);
  });

  it('throws on missing room/conversation ids', () => {
    expect(() =>
      parseAndoraLivekitToken({
        serverUrl: 'wss://livekit.example.com',
        participantToken: 'ptoken',
      }),
    ).toThrow('Andora token response missing room_name/conversation_id');

    expect(() =>
      parseAndoraLivekitToken({
        serverUrl: 'wss://livekit.example.com',
        participantToken: 'ptoken',
        room_name: 'andora-conv123',
      }),
    ).toThrow('Andora token response missing room_name/conversation_id');
  });
});

describe('reduceTurnEvent', () => {
  it('maps andora.turn.completed to processing', () => {
    expect(reduceTurnEvent('andora.turn.completed', {})).toEqual({
      status: 'processing',
      fetchRequired: false,
    });
  });

  it('sets fetchRequired true for fetch_required variant', () => {
    expect(
      reduceTurnEvent('andora.turn.completed', {
        type: 'andora.turn.completed.fetch_required',
      }),
    ).toEqual({ status: 'processing', fetchRequired: true });
  });

  it('maps andora.turn.ready to ready preserving empty_transcript reason', () => {
    expect(
      reduceTurnEvent('andora.turn.ready', { reason: 'empty_transcript' }),
    ).toEqual({
      status: 'ready',
      fetchRequired: false,
      reason: 'empty_transcript',
    });
  });

  it('maps andora.turn.ready without reason', () => {
    expect(reduceTurnEvent('andora.turn.ready', {})).toEqual({
      status: 'ready',
      fetchRequired: false,
      reason: undefined,
    });
  });

  it('maps andora.turn.failed to failed', () => {
    expect(reduceTurnEvent('andora.turn.failed', {})).toEqual({
      status: 'failed',
      fetchRequired: false,
    });
  });

  it('maps unknown topic to idle', () => {
    expect(reduceTurnEvent('something.else', {})).toEqual({
      status: 'idle',
      fetchRequired: false,
    });
  });
});

describe('parseRpcResponse', () => {
  it('parses accepted JSON string', () => {
    expect(
      parseRpcResponse(JSON.stringify({ status: 'accepted' })),
    ).toEqual({ status: 'accepted', state: undefined });
  });

  it('parses busy JSON string with state', () => {
    expect(
      parseRpcResponse(JSON.stringify({ status: 'busy', state: 'held' })),
    ).toEqual({ status: 'busy', state: 'held' });
  });

  it('parses unauthorized JSON string', () => {
    expect(
      parseRpcResponse(JSON.stringify({ status: 'unauthorized' })),
    ).toEqual({ status: 'unauthorized', state: undefined });
  });
});
