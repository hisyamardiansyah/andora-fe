// Requires a dev build (`npx expo run:android`); Expo Go will NOT work
// because react-native-share is a native module baked in at prebuild time.
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withReactNativeShare(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest.queries = manifest.queries ?? [];
    const hasWhatsapp = manifest.queries.some((query) =>
      (query.package ?? []).some(
        (pkg) => pkg.$?.['android:name'] === 'com.whatsapp'
      )
    );
    if (!hasWhatsapp) {
      manifest.queries.push({
        package: [{ $: { 'android:name': 'com.whatsapp' } }],
      });
    }
    return config;
  });
};
