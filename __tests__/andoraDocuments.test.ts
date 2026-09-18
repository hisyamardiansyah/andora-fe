// Behavior tests for the shipped document upload + signal parsers.
import {
  DOCUMENT_UPLOAD_PATH,
  parseDocumentReady,
  parseWhatsAppIntent,
  uploadDocumentForConversation,
} from '../lib/andoraDocuments';
import type { FetchLike } from '../lib/andoraApi';

process.env.EXPO_PUBLIC_ANDORA_API_URL = 'http://127.0.0.1:8000';

const CONV_ID = '2a2d3b52-9d20-4a13-8f1d-3c29d6c3e2c1';

describe('andora document upload', () => {
  it('posts multipart form with room_name and file', async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    const fetchImpl: FetchLike = async (url, init) => {
      calls.push({ url, init });
      return { ok: true, status: 200, json: async () => ({ status: 'success' }) };
    };
    const result = await uploadDocumentForConversation(
      fetchImpl,
      'token-123',
      CONV_ID,
      { uri: 'file:///tmp/surat.pdf', name: 'surat.pdf' }
    );
    expect(result.roomName).toBe(`andora-${CONV_ID}`);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe(
      `http://127.0.0.1:8000${DOCUMENT_UPLOAD_PATH}`
    );
    expect(calls[0]?.init?.method).toBe('POST');
    expect(
      (calls[0]?.init?.headers as Record<string, string>).Authorization
    ).toBe('Bearer token-123');
    const form = calls[0]?.init?.body as FormData;
    expect(form.get('room_name')).toBe(`andora-${CONV_ID}`);
  });

  it('rejects blank conversation and surfaces backend errors', async () => {
    const okFetch: FetchLike = async () => ({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    await expect(
      uploadDocumentForConversation(okFetch, 't', '   ', {
        uri: 'file:///x.pdf',
        name: 'x.pdf',
      })
    ).rejects.toThrow(/Conversation belum dipilih/);

    const badFetch: FetchLike = async () => ({
      ok: false,
      status: 400,
      json: async () => ({ detail: 'Hanya PDF yang diterima.' }),
    });
    await expect(
      uploadDocumentForConversation(badFetch, 't', CONV_ID, {
        uri: 'file:///x.pdf',
        name: 'x.pdf',
      })
    ).rejects.toThrow(/Hanya PDF/);
  });
});

describe('document signals', () => {
  it('parses DOCUMENT_READY with nama_dokumen and url', () => {
    expect(
      parseDocumentReady({
        event: 'DOCUMENT_READY',
        nama_dokumen: 'surat_pernyataan_5_poin',
        url: 'https://storage.example.com/surat.docx',
      })
    ).toEqual({
      namaDokumen: 'surat_pernyataan_5_poin',
      url: 'https://storage.example.com/surat.docx',
    });
    expect(parseDocumentReady({ event: 'OTHER' })).toBeNull();
    expect(
      parseDocumentReady({ event: 'DOCUMENT_READY', nama_dokumen: 'x' })
    ).toBeNull();
  });

  it('parses OPEN_WHATSAPP_INTENT with phone, file url, and caption', () => {
    expect(
      parseWhatsAppIntent({
        action: 'OPEN_WHATSAPP_INTENT',
        payload: {
          phone_number: '628123456789',
          file_url: 'https://storage.example.com/surat.docx',
          file_name: 'surat.docx',
          caption: 'Dokumen dari Andora',
        },
      })
    ).toEqual({
      phoneNumber: '628123456789',
      fileUrl: 'https://storage.example.com/surat.docx',
      fileName: 'surat.docx',
      caption: 'Dokumen dari Andora',
    });
    expect(parseWhatsAppIntent({ action: 'OTHER' })).toBeNull();
    expect(
      parseWhatsAppIntent({ action: 'OPEN_WHATSAPP_INTENT', payload: {} })
    ).toBeNull();
  });
});
