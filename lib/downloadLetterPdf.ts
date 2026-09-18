import { File, Paths } from 'expo-file-system';

// Downloads the letter PDF to the app cache directory.
export async function downloadLetterPdf(docId?: string): Promise<string> {
  const baseUrl = process.env.EXPO_PUBLIC_ANDORA_LETTER_URL;
  if (!baseUrl) {
    throw new Error('letter URL not configured');
  }
  const url = docId ? `${baseUrl}?doc=${encodeURIComponent(docId)}` : baseUrl;
  const file = new File(Paths.cache, 'andora-surat.pdf');
  try {
    await File.downloadFileAsync(url, file, { idempotent: true });
  } catch (error) {
    throw new Error('letter download failed: ' + (error instanceof Error ? error.message : String(error)));
  }
  return file.uri;
}
