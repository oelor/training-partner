# Training Partner - Mobile Builds (Capacitor)

The native iOS and Android shells are powered by Capacitor.
They load the deployed web app at `https://trainingpartner.app` via a WebView
so there is no static export step required.

## Prerequisites

- Node 18+
- Xcode 15+ (iOS) with CocoaPods
- Android Studio Hedgehog+ with SDK 34 (Android)
- Capacitor CLI: `npm install` at repo root installs it

## Day-to-day workflow

```bash
# Sync config and plugin changes into native projects
npx cap sync

# Open native IDE
npx cap open ios
npx cap open android
```

## iOS - TestFlight

1. Open the Xcode project:
   ```bash
   npx cap open ios
   ```
2. In Xcode, select the **App** target.
3. Set **Signing & Capabilities**:
   - Team: your Apple Developer account
   - Bundle Identifier: `app.trainingpartner`
4. Select a destination (device or "Any iOS Device (arm64)").
5. **Product > Archive**.
6. In the Organizer, click **Distribute App > App Store Connect**.
7. Upload, then go to [App Store Connect](https://appstoreconnect.apple.com),
   select the build under TestFlight, add testers, and submit for review.

### First-time CocoaPods setup

```bash
cd ios/App
pod install
```

## Android - Play Store Internal Testing

1. Open the Android project:
   ```bash
   npx cap open android
   ```
2. In Android Studio, set the signing config in
   `android/app/build.gradle` (release keystore).
3. **Build > Generate Signed Bundle / APK > Android App Bundle (.aab)**.
4. Go to [Google Play Console](https://play.google.com/console),
   create the app (package `app.trainingpartner`), upload the `.aab`
   under **Internal testing**, and add testers by email.

### Signing key (one-time)

```bash
keytool -genkey -v -keystore training-partner-release.keystore \
  -alias training-partner -keyalg RSA -keysize 2048 -validity 10000
```

Store the keystore and passwords securely; never commit them.

## Capacitor config

The server URL and plugin settings live in `capacitor.config.ts` at the repo root.
After editing, run `npx cap sync` to push changes to native projects.

## Updating plugins

```bash
npm update @capacitor/core @capacitor/ios @capacitor/android
npm update @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard @capacitor/haptics @capacitor/share @capacitor/browser
npx cap sync
```
