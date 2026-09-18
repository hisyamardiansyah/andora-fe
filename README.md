# Andora Test — Voice Assistant (React Native + Expo + LiveKit)

Aplikasi voice assistant berbasis Expo Router + LiveKit.

## Menjalankan lokal

```sh
npm install
npx expo start
```

Untuk Android native:

```sh
npx expo run:android
```

Konfigurasi lewat env (lihat `.env.example`):

- `EXPO_PUBLIC_ANDORA_TOKEN_URL` — URL token server Andora
- `EXPO_PUBLIC_LIVEKIT_AGENT_NAME` — nama agent (default `andora-voice-agent`)
- `EXPO_PUBLIC_LIVEKIT_SANDBOX_ID` — opsional, fallback sandbox LiveKit

## Test / lint / typecheck

```sh
npm run ci:test
npm run lint
npm run typescript
```

## Build & release Android (GitHub Actions)

Build release dilakukan sepenuhnya di GitHub Actions, tidak di laptop lokal:

- Workflow **Test** (`.github/workflows/test.yaml`): jalan di tiap push/PR ke `main` — `npm ci`, typecheck, lint, jest.
- Workflow **Android Release** (`.github/workflows/android-release.yml`):
  - Manual lewat tab Actions (bisa isi tag, ABI, AAB, pre-release), atau
  - Otomatis saat push tag `v*`, contoh: `git tag v1.0.0 && git push origin v1.0.0`
  - Hasil: APK (+ AAB opsional) di-upload sebagai artifact dan diterbitkan ke GitHub Release.

Secret yang dibutuhkan (atur di Settings → Secrets → Actions):

| Secret | Wajib | Guna |
| --- | --- | --- |
| `EXPO_PUBLIC_LIVEKIT_SANDBOX_ID` | Tidak | Di-inline Metro saat bundling JS |
| `ANDROID_KEYSTORE_BASE64` | Untuk rilis Play Store | Keystore rilis (base64). Kalau kosong, APK ditandatangani debug keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Jika pakai keystore | Password keystore |
| `ANDROID_KEY_ALIAS` | Jika pakai keystore | Alias key |
| `ANDROID_KEY_PASSWORD` | Jika pakai keystore | Password key |

Folder `android/`, `ios/`, `node_modules/`, dan `.expo/` tidak di-commit — direktori native di-generate ulang di CI lewat `npx expo prebuild`.
