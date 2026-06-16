import type { ExpoConfig } from '@expo/config-types';
import appJson from './app.json';

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

const config: ExpoConfig = {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    ...(apiKey ? { config: { googleMaps: { apiKey } } } : {}),
  },
  ios: {
    ...appJson.expo.ios,
    ...(apiKey ? { config: { googleMapsApiKey: apiKey } } : {}),
  },
  plugins: [
    ...(Array.isArray(appJson.expo.plugins) ? appJson.expo.plugins : []),
    'expo-font',
  ],
} as ExpoConfig;

export default config;