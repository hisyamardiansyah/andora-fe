# Andora — Voice AI Companion for Document Assistance

![Expo](https://img.shields.io/badge/Expo-%7E54.0-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.81-061DA9?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-%7E5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![LiveKit](https://img.shields.io/badge/LiveKit-Voice_AI-002BFF?style=for-the-badge&logo=webrtc&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo_Router-File_Based-4630EB?style=for-the-badge&logo=expo&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-Tested-C21325?style=for-the-badge&logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-Clean-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **Andora** is an Indonesian-language voice assistant that helps users handle civil documents
> and official letters — from live voice conversation, to comprehension confirmation,
> to a list of letters ready to send. It is built with **Expo + React Native + LiveKit**,
> file-based routing (**Expo Router**), and centralized design tokens (`constants/Andora.ts`).

---

## Table of Contents

- [Highlights](#highlights)
- [User Flow](#user-flow)
- [Key Features](#key-features)
- [Technology](#technology)
- [Project Structure](#project-structure)
- [Routes and Figma Mapping](#routes-and-figma-mapping)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [NPM Scripts](#npm-scripts)
- [Code Quality](#code-quality)
- [Android Build and Release (CI)](#android-build-and-release-ci)
- [Release Signing](#release-signing)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## Highlights

| Aspect | Detail |
| --- | --- |
| **Platforms** | Android, iOS, Web (primary focus: Android) |
| **UI language** | Indonesian |
| **Code style** | `StyleSheet` only, no Tailwind — tokens in `constants/Andora.ts` |
| **Navigation** | Expo Router with route groups `(start)`, `onboarding`, `auth`, `home`, `assistant` |
| **Real-time voice** | LiveKit (`@livekit/react-native`, `livekit-client`) with microphone visualization |
| **Design reference** | Figma *Andora (Copy)* — `fileKey 7IHCYJs2bVqT4uzuCJKzhF` |
| **CI** | GitHub Actions: `Test` on every push/PR to `main`, `Android Release` manually and automatically via `v*` tags |
| **Native code** | The `android/` directory is regenerated in CI via `expo prebuild` — do not edit it by hand |

---

## User Flow

```text
Splash (start)
  └─> Sign in (auth)
        └─> Home (home)
              ├─> Tap to speak ──> Listening assistant (assistant)
              │                      └─> Comprehension check (assistant/validate)
              ├─> Messages (home/sessions)
              ├─> Documents (home/insight)
              └─> Profile (home/profile)
```

1. **Splash** — Andora logo with a loading indicator, then automatic navigation to sign-in.
2. **Sign-in** — a single **Continue with Google** button (SSO placeholder; it currently
   goes straight to home until Supabase credentials are configured).
3. **Home** — centered title, reminder card, greeting, and a large microphone button.
4. **Assistant** — listening screen matching the Figma design: blue orb, waveform, cancel button.
5. **Validation** — Andora shows what it understood and asks for confirmation before continuing.
6. **Documents / Messages / Profile** — letters ready to send, conversation history, and user profile.

---

## Key Features

| Feature | Status | Location |
| --- | --- | --- |
| Splash with automatic redirect | Done | `app/(start)/index.tsx` |
| Google sign-in screen (SSO placeholder) | Done | `app/auth/index.tsx` |
| Home: centered title, bell and clock icons, mic orb | Done | `app/home/index.tsx` |
| Listening screen matching Figma 21-1064 | Done | `app/assistant/index.tsx` |
| Agent visualization (orb plus waveform) | Done | `app/assistant/ui/AgentVisualization.tsx` |
| Comprehension confirmation before continuing | Done | `app/assistant/validate.tsx` |
| Message list plus new-request sheet | Done | `app/home/sessions.tsx` |
| Document list (cards only) | Done | `app/home/insight.tsx` |
| Profile plus sign-out to sign-in | Done | `app/home/profile.tsx` |
| Bottom navigation (Home/Messages/Documents/Profile) | Done | `components/AndoraNavbar.tsx` |
| Full Supabase Google login | Next | See [Roadmap](#roadmap) |

---

## Technology

| Layer | Choice |
| --- | --- |
| Framework | Expo `~54.0`, React `19.1.0`, React Native `0.81.5` |
| Navigation | Expo Router `~6.0`, Typed Routes |
| Language | TypeScript `~5.9` (strict, `tsc --noemit`) |
| Voice | `livekit-client`, `@livekit/react-native`, `@livekit/components-react` |
| UI | React Native `StyleSheet`, `@expo/vector-icons`, `react-native-safe-area-context` |
| Animation and gestures | `react-native-reanimated`, `react-native-gesture-handler` |
| Testing | Jest with `jest-expo` (`npm run ci:test -- --passWithNoTests`) |
| Linting | `expo lint` (ESLint plus Prettier) |
| Native builds | Expo Prebuild plus Gradle (Android); EAS/CI for releases |

---

## Project Structure

```text
.
├── app/                        # Expo Router — one file equals one route
│   ├── _layout.tsx             # Root stack plus ConnectionProvider plus Andora theme
│   ├── (start)/index.tsx       # Splash screen, redirects to /auth
│   ├── onboarding/index.tsx    # Deprecated — redirects to /auth only
│   ├── auth/index.tsx          # Google sign-in (SSO placeholder)
│   ├── home/
│   │   ├── _layout.tsx         # Stack: index, sessions, insight, profile
│   │   ├── index.tsx           # Home (Figma 11-6)
│   │   ├── sessions.tsx        # Messages (Figma 41-121)
│   │   ├── insight.tsx         # Documents — card list only
│   │   └── profile.tsx         # Profile plus sign-out
│   └── assistant/
│       ├── _layout.tsx         # Stack: index, validate
│       ├── index.tsx           # Listening screen (Figma 21-1064)
│       ├── validate.tsx        # Comprehension check (Figma 22-1254)
│       └── ui/                 # AgentVisualization, ChatBar, ChatLog, ControlBar
├── components/AndoraNavbar.tsx # Shared bottom navigation
├── constants/Andora.ts         # Color, spacing, radius, and typography tokens
├── hooks/useConnection.tsx     # LiveKit connection (token server / sandbox)
├── lib/
│   ├── andoraRoutes.ts         # Figma node to route mapping
│   └── andoraToken.ts          # Token server response parser
├── assets/images/              # App icons and illustrations
├── scripts/ci/                 # CI utilities (Android release signing patch)
├── setup/livekitSetup.ts       # LiveKit setup guide and helpers
├── app.json                    # Expo configuration
├── taskfile.yaml               # Post-template creation tasks
└── .github/workflows/          # CI: test.yaml, android-release.yml
```

> The `android/`, `ios/`, `node_modules/`, and `.expo/` directories are **not committed**.
> Native projects are regenerated in CI with `npx expo prebuild`.

---

## Routes and Figma Mapping

Design reference: Figma *Andora (Copy)* — file key `7IHCYJs2bVqT4uzuCJKzhF`.
The full mapping is defined in `lib/andoraRoutes.ts`.

| Figma node | Route | File |
| --- | --- | --- |
| `18-1034` | `/(start)` | `app/(start)/index.tsx` |
| `11-6` | `/home` | `app/home/index.tsx` |
| `21-1064`, `22-1220`, `23-1311`, `29-1786` | `/assistant` | `app/assistant/index.tsx` |
| `22-1254` | `/assistant/validate` | `app/assistant/validate.tsx` |
| `43-356` | `/home/insight` | `app/home/insight.tsx` |
| `41-121`, `43-217` | `/home/sessions` | `app/home/sessions.tsx` |
| — | `/auth` | `app/auth/index.tsx` |
| — | `/home/profile` | `app/home/profile.tsx` |
| — (deprecated) | `/onboarding` | `app/onboarding/index.tsx` (redirect) |

---

## Requirements

| Requirement | Version / Notes |
| --- | --- |
| Node.js | `22.x` (latest LTS recommended) |
| npm | Bundled with Node 22 (`npm ci` for clean installs) |
| Expo CLI | Via `npx expo` — no global install needed |
| Android Studio plus SDK | For `expo run:android` and emulators |
| Xcode (macOS only) | For `expo run:ios` and simulators |
| LiveKit account | Andora token server **or** Sandbox ID |
| Supabase account (optional, next phase) | For full Google SSO |

---

## Quick Start

```sh
# 1. Install dependencies
npm ci

# 2. Prepare environment (copy and fill in)
cp .env.example .env.local
# — or create .env.local manually, see the table below —

# 3. Run with the Expo dev server
npx expo start

# 4. Specific targets
npx expo run:android
npx expo run:ios
npx expo start --web
```

> Tip: press `a` for Android, `i` for iOS, or `w` for web from the Expo CLI menu.

---

## Environment Configuration

Every variable used by the app starts with `EXPO_PUBLIC_` so it is readable on the client.
Never store private keys or release credentials in this file.

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_ANDORA_TOKEN_URL` | Yes (production) | `https://token.andora.id/api/token` | Andora LiveKit token endpoint |
| `EXPO_PUBLIC_LIVEKIT_AGENT_NAME` | No | `andora-voice-agent` | Name of the agent to contact |
| `EXPO_PUBLIC_LIVEKIT_SANDBOX_ID` | No | `abc123…` | LiveKit sandbox fallback when the token URL is empty |
| `EXPO_PUBLIC_SUPABASE_URL` | Later | `https://xyz.supabase.co` | Supabase base URL (full SSO) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Later | `eyJhbGciOi…` | Supabase public key (never the service role key) |
| `EXPO_PUBLIC_ANDORA_LETTER_URL` | Yes (real send) | `https://api.andora.id/letters/surat.pdf` | Backend PDF URL for WhatsApp send; app routes to the error screen when unset |

> WhatsApp send needs a dev build (`npx expo run:android`), not Expo Go,
> because `react-native-share` is a native module.

Example `.env.local`:

```env
EXPO_PUBLIC_ANDORA_TOKEN_URL=https://token.andora.id/api/token
EXPO_PUBLIC_LIVEKIT_AGENT_NAME=andora-voice-agent
EXPO_PUBLIC_LIVEKIT_SANDBOX_ID=
# Next phase — Supabase SSO:
# EXPO_PUBLIC_SUPABASE_URL=
# EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Token source priority in `hooks/useConnection.tsx`:

1. `EXPO_PUBLIC_ANDORA_TOKEN_URL` — the Andora token server,
2. `EXPO_PUBLIC_LIVEKIT_SANDBOX_ID` — the sandbox token server,
3. the LiveKit demo agent fallback (development only).

---

## NPM Scripts

| Command | Purpose |
| --- | --- |
| `npm start` / `npx expo start` | Expo dev server |
| `npm run android` | `expo run:android` — build and run on Android |
| `npm run ios` | `expo run:ios` — build and run on iOS |
| `npm run web` | `expo start --web` — run in the browser |
| `npm run typescript` | `tsc --noemit -p tsconfig.json` |
| `npm run lint` | `expo lint` |
| `npm test` | Jest in watch mode |
| `npm run ci:test` | Single Jest run (used by CI) |

---

## Code Quality

```sh
npm run typescript
npm run lint
npm run ci:test -- --passWithNoTests
```

- **Strict TypeScript** — the `@/*` path alias points to the project root.
- **One styling system** — `StyleSheet` plus the `Andora` tokens; no Tailwind or nativewind.
- **Consistent icons** — `@expo/vector-icons` (Ionicons) following the Figma design.
- **Minimal comments** — only Figma node references and non-obvious constraints.

---

## Android Build and Release (CI)

Releases are **never built on a laptop** — everything runs through GitHub Actions
so results are deterministic.

| Workflow | Trigger | Contents |
| --- | --- | --- |
| `Test` (`.github/workflows/test.yaml`) | Push/PR to `main` | `npm ci`, typecheck, lint, Jest |
| `Android Release` (`.github/workflows/android-release.yml`) | Manual via the Actions tab **or** push of a `v*` tag | Prebuild, signing, APK (plus optional AAB), artifacts, GitHub Release |

### How to release

**Option A — manually (recommended for release testing):**

1. Open the **Actions → Android Release → Run workflow** screen.
2. Optionally fill in: `tag` (for example `v1.0.0`), `architectures`
   (for example `arm64-v8a,armeabi-v7a`), check `build_aab` for a Play Store AAB,
   and `prerelease` for a test release.
3. Download the APK/AAB from **Artifacts** and the **Releases** page.

**Option B — automatically via tag:**

```sh
git tag v1.0.0
git push origin v1.0.0
```

### What `android-release.yml` does (summary)

1. Checks out the code and sets up Node 22, Java 17, and the Gradle cache.
2. Runs `npm ci`, then `npx expo prebuild --platform android --clean --no-install`.
3. Increases Gradle memory and enables release signing when a keystore is available.
4. Runs `./gradlew assembleRelease` (and `bundleRelease` when requested).
5. Copies results to `dist/voice-assistant-<version>.apk` (and `.aab`).
6. Uploads artifacts (30-day retention), publishes the GitHub Release, and writes a job summary.

---

## Release Signing

- Without a release keystore, CI still produces an APK, but it is marked **debug** and
  **cannot be used to update an already installed app**.
- For Play Store or update releases, provide a **release keystore file** through
  **repository secrets** (Settings → Secrets → Actions).
- Signing credentials are also stored as secrets and are only read while the release job
  runs — **never write their values into the README, code, or logs**.
- The authoritative source for secret names and usage is
  `.github/workflows/android-release.yml` together with `scripts/ci/patch-android-signing.mjs`.

> Approach used: the keystore is decoded from a secret into a temporary
> `android/app/release.keystore` on the runner, then `patch-android-signing.mjs` points
> `buildTypes.release` at `signingConfigs.release`. The keystore file is never committed.

---

## Security

- Never commit `.env.local`, `*.keystore`, `*.jks`, or any credentials.
- Private keys only exist in GitHub Actions secrets, never in code.
- Public keys (`EXPO_PUBLIC_*`, the Supabase anon key) may be used on the client;
  the `service_role` key **must never** ship in the app.
- Current SSO behavior: the Google button goes straight to home until Supabase is
  configured — do not treat it as real authentication until the TODO in
  `app/auth/index.tsx` is connected.

---

## Troubleshooting

<details>
<summary><strong>Metro / bundler fails after switching branches</strong></summary>

```sh
rm -rf node_modules .expo
npm ci
npx expo start -c
```

</details>

<details>
<summary><strong>`expo run:android` fails — SDK / emulator not found</strong></summary>

- Install Android Studio plus the platform SDK and start an emulator.
- Try `npx expo start`, then press `a` to open it on a device or emulator.
- In CI this does not happen because the build uses `expo prebuild` plus Gradle.

</details>

<details>
<summary><strong>Voice / microphone does not work on a device</strong></summary>

- Grant microphone and camera permissions when prompted (see the permission list in `app.json`).
- On Android 12 and later, make sure Bluetooth and audio permissions are not permanently denied.
- Check `hooks/useConnection.tsx`: the token URL or sandbox ID must be set.

</details>

<details>
<summary><strong>A release APK cannot update the old app</strong></summary>

- This means a different keystore was used (debug versus release). Repeat the release
  with the same keystore as the installed version. See the
  “Warn when no release keystore is configured” warning in the job log.

</details>

---

## Roadmap

- [ ] Full Google SSO via Supabase (`signInWithOAuth`, deep links, persistent sessions).
- [ ] Document details plus downloading and sharing letters from the document list.
- [ ] Message history connected to a backend instead of static examples.
- [ ] Offline mode and a letter sending queue.
- [ ] End-to-end tests (Maestro/Detox) for splash, sign-in, home, and assistant.
- [ ] Final icons and splash assets from Figma as versioned files.

---

## Contributing

1. Create a branch: `git checkout -b feat/feature-name`.
2. Run `npm run typescript && npm run lint && npm run ci:test`.
3. Follow the tokens in `constants/Andora.ts` and reference the Figma node in a comment when changing UI.
4. Open a PR to `main` — the `Test` CI workflow must be green before merging.

---

## License

MIT — see [`LICENSE`](./LICENSE). Initial copyright © 2025 LiveKit, Inc. for the template,
developed further as Andora.

---

## Credits

- [LiveKit](https://livekit.io/) — real-time voice infrastructure and agents.
- [Expo](https://expo.dev/) — React Native framework, router, and tooling.
- The Andora design team — the *Andora (Copy)* Figma reference.
