import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.trainingpartner',
  appName: 'Training Partner',
  webDir: 'out',
  server: {
    url: 'https://trainingpartner.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#0D0D0D',
      launchAutoHide: true,
      launchShowDuration: 2000,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
  ios: {
    backgroundColor: '#0D0D0D',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'Training Partner',
  },
  android: {
    backgroundColor: '#0D0D0D',
    allowMixedContent: false,
  },
};

export default config;
