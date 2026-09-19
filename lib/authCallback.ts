// Pure helpers for the Supabase Google SSO callback.
// Supabase may return the auth code in the query (?code=) or in the
// fragment (#access_token=...&... or #code=...), depending on flow and
// provider settings. The app exchanges `code` via exchangeCodeForSession
// and surfaces clear Indonesian errors otherwise.
export interface ParsedAuthCallback {
  code: string | null;
  error: string | null;
  errorDescription: string | null;
}

function paramsOf(query: string): URLSearchParams {
  const clean = query.startsWith('#') || query.startsWith('?') ? query.slice(1) : query;
  return new URLSearchParams(clean);
}

export function parseAuthCallbackUrl(url: string): ParsedAuthCallback {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  let query = '';
  let fragment = '';
  if (queryIndex >= 0) {
    query = hashIndex > queryIndex ? url.slice(queryIndex, hashIndex) : url.slice(queryIndex);
  }
  if (hashIndex >= 0) {
    fragment = url.slice(hashIndex);
  }
  const q = paramsOf(query);
  const f = paramsOf(fragment);
  const code = q.get('code') ?? f.get('code');
  const error = q.get('error') ?? f.get('error');
  const errorDescription =
    q.get('error_description') ?? f.get('error_description');
  return { code, error, errorDescription };
}

export function authCallbackErrorMessage(parsed: ParsedAuthCallback): string | null {
  if (parsed.error) {
    const detail = parsed.errorDescription
      ? `: ${parsed.errorDescription.replace(/\+/g, ' ')}`
      : '';
    return `Login Google gagal (${parsed.error}${detail})`;
  }
  if (!parsed.code) {
    return 'Login Google gagal: kode otorisasi tidak ditemukan di URL callback';
  }
  return null;
}
