import type { ShareSingleOptions } from 'react-native-share';

export const SHARE_CANCELLED_CODE = 'USER_CANCELLED';

function cancelledError(): Error {
  const err = new Error('User cancelled WhatsApp share') as Error & {
    code?: string;
  };
  err.code = SHARE_CANCELLED_CODE;
  return err;
}

function isCancelMessage(message: unknown): boolean {
  if (typeof message !== 'string') return false;
  return /cancel|did not share|dismiss/i.test(message);
}

// Shares a local file directly to WhatsApp. The user picks the contact
// inside WhatsApp with the file pre-attached and taps send.
export interface ShareFileOptions {
  mimeType?: string;
  filename?: string;
  message?: string;
}

export async function shareFileToWhatsApp(
  localUri: string,
  opts?: ShareFileOptions
): Promise<'shared'> {
  try {
    let Share: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      Share = require('react-native-share').default;
    } catch {
      throw new Error(
        'WhatsApp share needs a dev build (npx expo run:android); not available in Expo Go'
      );
    }
    const result = await Share.shareSingle({
      url: localUri,
      type: opts?.mimeType ?? 'application/pdf',
      filename: opts?.filename ?? 'surat-andora',
      message: opts?.message,
      social: Share.Social.WHATSAPP,
      failOnCancel: true,
    } as ShareSingleOptions);
    if (!result.success) {
      throw cancelledError();
    }
    return 'shared';
  } catch (error) {
    if ((error as { code?: string }).code === SHARE_CANCELLED_CODE) {
      throw error;
    }
    if (error instanceof Error && isCancelMessage(error.message)) {
      throw cancelledError();
    }
    throw error;
  }
}

// Back-compat wrapper for the letter flow (PDF letter + optional message).
export async function shareLetterToWhatsApp(
  localUri: string,
  message?: string
): Promise<'shared'> {
  return shareFileToWhatsApp(localUri, { message });
}
