#!/usr/bin/env node
// Patches android/app/build.gradle to use the release keystore from env vars.
// Usage: node scripts/ci/patch-android-signing.mjs android/app/build.gradle
// Env: RELEASE_KEYSTORE_PATH, RELEASE_KEYSTORE_PASSWORD, RELEASE_KEY_ALIAS, RELEASE_KEY_PASSWORD
import fs from 'node:fs';

const target = process.argv[2] ?? 'android/app/build.gradle';
const src = fs.readFileSync(target, 'utf8');

if (src.includes('signingConfigs.release') && src.includes('RELEASE_KEYSTORE_PATH')) {
  console.log('Signing already patched, skipping.');
  process.exit(0);
}

let out = src;

// 1. Add a `release` signing config next to `debug`.
out = out.replace(
  /(signingConfigs\s*\{\s*\n(?:.*\n)*?\s*debug\s*\{[^}]*\}\s*\n)(\s*\})/m,
  (_m, head, tail) => {
    const block = `        release {
            storeFile file(System.getenv("RELEASE_KEYSTORE_PATH") ?: "release.keystore")
            storePassword System.getenv("RELEASE_KEYSTORE_PASSWORD")
            keyAlias System.getenv("RELEASE_KEY_ALIAS")
            keyPassword System.getenv("RELEASE_KEY_PASSWORD")
        }
`;
    return `${head}${block}${tail}`;
  },
);

// 2. Point the release buildType at the release signing config.
out = out.replace(
  /(buildTypes\s*\{\s*\n(?:.*\n)*?\s*release\s*\{\s*\n(?:.*\n)*?\s*signingConfig\s+)signingConfigs\.debug/,
  '$1signingConfigs.release',
);

if (out === src) {
  console.error('Patch made no changes. Check android/app/build.gradle format.');
  process.exit(1);
}

fs.writeFileSync(target, out);
console.log(`Patched release signing in ${target}`);
