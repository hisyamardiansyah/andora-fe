// Pure route/URL helpers for the letter send flow (sending / send-retry /
// send-error / send-result). No React or expo-router imports: unit-testable.
export function resolveDocId(conversationId?: string): string | undefined {
  return typeof conversationId === 'string' && conversationId.trim()
    ? conversationId.trim()
    : undefined;
}

export function letterDownloadUrl(
  conversationId?: string,
  baseUrl = process.env.EXPO_PUBLIC_ANDORA_LETTER_URL
): string {
  if (!baseUrl) {
    throw new Error(
      'URL surat backend belum dikonfigurasi. Atur EXPO_PUBLIC_ANDORA_LETTER_URL.'
    );
  }
  const doc = resolveDocId(conversationId);
  return doc ? `${baseUrl}?doc=${encodeURIComponent(doc)}` : baseUrl;
}

export function sendOkRoute(conversationId?: string): {
  pathname: '/assistant/send-result';
  params: Record<string, string>;
} {
  const doc = resolveDocId(conversationId);
  return {
    pathname: '/assistant/send-result',
    params: doc ? { ok: '1', conversationId: doc } : { ok: '1' },
  };
}

export function sendErrorRoute(
  conversationId?: string,
  failure?: string
): {
  pathname: '/assistant/send-error';
  params: Record<string, string>;
} {
  const doc = resolveDocId(conversationId);
  const params: Record<string, string> = {};
  if (doc) params.conversationId = doc;
  const message = failure?.trim();
  if (message) params.message = message;
  return { pathname: '/assistant/send-error', params };
}

export function sendRetryRoute(conversationId?: string): {
  pathname: '/assistant/send-retry';
  params: Record<string, string>;
} {
  const doc = resolveDocId(conversationId);
  return {
    pathname: '/assistant/send-retry',
    params: doc ? { conversationId: doc } : {},
  };
}
