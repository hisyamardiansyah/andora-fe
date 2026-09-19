// Unit tests for the shipped SSO callback parser.
import {
  authCallbackErrorMessage,
  parseAuthCallbackUrl,
} from '../lib/authCallback';

describe('parseAuthCallbackUrl', () => {
  it('reads code from query params', () => {
    const parsed = parseAuthCallbackUrl(
      'myapp://auth/callback?code=abc123'
    );
    expect(parsed.code).toBe('abc123');
    expect(authCallbackErrorMessage(parsed)).toBeNull();
  });

  it('reads code from fragment params', () => {
    const parsed = parseAuthCallbackUrl(
      'myapp://auth/callback#code=xyz789&scope=email'
    );
    expect(parsed.code).toBe('xyz789');
    expect(authCallbackErrorMessage(parsed)).toBeNull();
  });

  it('surfaces provider errors with description', () => {
    const parsed = parseAuthCallbackUrl(
      'myapp://auth/callback?error=access_denied&error_description=User+denied+access'
    );
    expect(authCallbackErrorMessage(parsed)).toMatch(/access_denied/);
    expect(authCallbackErrorMessage(parsed)).toMatch(/User denied access/);
  });

  it('reports a clear message when code is missing', () => {
    const parsed = parseAuthCallbackUrl('myapp://auth/callback');
    expect(authCallbackErrorMessage(parsed)).toMatch(
      /kode otorisasi tidak ditemukan/
    );
  });
});
