import { File, Paths } from 'expo-file-system';
import type { DownloadOptions } from 'expo-file-system';
import { letterDownloadUrl } from './letterSendRoutes';

// Host label for error messages; falls back to raw URL.
function backendHost(baseUrl: string): string {
  try {
    return new URL(baseUrl).host;
  } catch {
    return baseUrl;
  }
}

// Downloads the letter PDF to the app cache directory.
export async function downloadLetterPdf(
  docId?: string,
  opts?: { accessToken?: string }
): Promise<string> {
  const url = letterDownloadUrl(docId);
  const baseUrl = process.env.EXPO_PUBLIC_ANDORA_LETTER_URL as string;
  const file = new File(Paths.cache, 'andora-surat.pdf');
  const options: DownloadOptions = { idempotent: true };
  if (opts?.accessToken) {
    options.headers = { Authorization: `Bearer ${opts.accessToken}` };
  }
  try {
    await File.downloadFileAsync(url, file, options);
  } catch (error) {
    throw new Error(
      `Gagal mengunduh surat dari ${backendHost(baseUrl)}: ` +
        (error instanceof Error ? error.message : String(error))
    );
  }
  return file.uri;
}
