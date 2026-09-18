// Behavior tests for the shipped letter send helpers.
import {
  letterDownloadUrl,
  resolveDocId,
  sendErrorRoute,
  sendOkRoute,
  sendRetryRoute,
} from '../lib/letterSendRoutes';

const CONV_ID = '2a2d3b52-9d20-4a13-8f1d-3c29d6c3e2c1';
const LETTER_BASE = 'https://letters.example.com/surat.pdf';

describe('letter send context', () => {
  it('carries the active conversation id into the download URL', () => {
    expect(letterDownloadUrl(CONV_ID, LETTER_BASE)).toBe(
      `${LETTER_BASE}?doc=${encodeURIComponent(CONV_ID)}`
    );
  });

  it('omits doc param without a conversation id', () => {
    expect(letterDownloadUrl(undefined, LETTER_BASE)).toBe(LETTER_BASE);
    expect(letterDownloadUrl('   ', LETTER_BASE)).toBe(LETTER_BASE);
  });

  it('fails closed when the letter backend is unconfigured', () => {
    expect(() => letterDownloadUrl(CONV_ID, '')).toThrow(
      /belum dikonfigurasi/
    );
    expect(() => letterDownloadUrl(CONV_ID, undefined)).toThrow(
      /belum dikonfigurasi/
    );
  });

  it('keeps conversation context on ok/error/retry routes', () => {
    expect(sendOkRoute(CONV_ID)).toEqual({
      pathname: '/assistant/send-result',
      params: { ok: '1', conversationId: CONV_ID },
    });
    expect(sendRetryRoute(CONV_ID)).toEqual({
      pathname: '/assistant/send-retry',
      params: { conversationId: CONV_ID },
    });
    expect(sendErrorRoute(CONV_ID, 'Gagal mengunduh surat')).toEqual({
      pathname: '/assistant/send-error',
      params: { conversationId: CONV_ID, message: 'Gagal mengunduh surat' },
    });
    expect(sendErrorRoute(undefined, 'boom')).toEqual({
      pathname: '/assistant/send-error',
      params: { message: 'boom' },
    });
  });

  it('normalizes blank conversation ids', () => {
    expect(resolveDocId('   ')).toBeUndefined();
    expect(resolveDocId(CONV_ID)).toBe(CONV_ID);
    expect(sendOkRoute(undefined)).toEqual({
      pathname: '/assistant/send-result',
      params: { ok: '1' },
    });
    expect(sendRetryRoute(undefined)).toEqual({
      pathname: '/assistant/send-retry',
      params: {},
    });
  });
});
