import type { TokenSourceResponseObject } from 'livekit-client';

export function parseAndoraTokenResponse(data: unknown): TokenSourceResponseObject {
  const record = (data ?? {}) as Record<string, unknown>;
  const serverUrl = record.serverUrl ?? record.ws_url ?? record.url ?? record.livekitUrl;
  const participantToken = record.participantToken ?? record.token ?? record.accessToken;
  if (typeof serverUrl !== 'string' || !serverUrl || typeof participantToken !== 'string' || !participantToken) {
    throw new Error('Andora token response missing serverUrl/participantToken');
  }
  return { serverUrl, participantToken };
}
