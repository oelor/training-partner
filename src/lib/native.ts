/**
 * Native bridge helpers for Capacitor.
 *
 * Every function is a safe no-op when running in a regular browser.
 * Import freely in any component — no conditional imports needed.
 */

import { Capacitor } from '@capacitor/core';

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

/** True when the app is running inside a Capacitor native shell. */
export const isNative = Capacitor.isNativePlatform();

/** 'ios' | 'android' | 'web' */
export const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';

export const isIOS = platform === 'ios';
export const isAndroid = platform === 'android';

// ---------------------------------------------------------------------------
// Haptics
// ---------------------------------------------------------------------------

export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!isNative) return;
  const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
  const map = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
  await Haptics.impact({ style: map[style] });
}

export async function hapticNotification(type: 'success' | 'warning' | 'error' = 'success') {
  if (!isNative) return;
  const { Haptics, NotificationType } = await import('@capacitor/haptics');
  const map = {
    success: NotificationType.Success,
    warning: NotificationType.Warning,
    error: NotificationType.Error,
  };
  await Haptics.notification({ type: map[type] });
}

export async function hapticSelection() {
  if (!isNative) return;
  const { Haptics } = await import('@capacitor/haptics');
  await Haptics.selectionStart();
  await Haptics.selectionChanged();
  await Haptics.selectionEnd();
}

// ---------------------------------------------------------------------------
// Share
// ---------------------------------------------------------------------------

export async function share(opts: { title?: string; text?: string; url?: string }) {
  if (!isNative) {
    // Fallback to Web Share API if available
    if (navigator.share) {
      await navigator.share(opts);
    }
    return;
  }
  const { Share } = await import('@capacitor/share');
  await Share.share(opts);
}

// ---------------------------------------------------------------------------
// In-app browser
// ---------------------------------------------------------------------------

export async function openBrowser(url: string) {
  if (!isNative) {
    window.open(url, '_blank');
    return;
  }
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url });
}

// ---------------------------------------------------------------------------
// Status bar
// ---------------------------------------------------------------------------

/** Apply dark status bar style. Call once on app init. */
export async function initStatusBar() {
  if (!isNative) return;
  const { StatusBar, Style } = await import('@capacitor/status-bar');
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({ color: '#0D0D0D' });
}

export async function hideStatusBar() {
  if (!isNative) return;
  const { StatusBar } = await import('@capacitor/status-bar');
  await StatusBar.hide();
}

export async function showStatusBar() {
  if (!isNative) return;
  const { StatusBar } = await import('@capacitor/status-bar');
  await StatusBar.show();
}

// ---------------------------------------------------------------------------
// Splash screen
// ---------------------------------------------------------------------------

export async function hideSplashScreen() {
  if (!isNative) return;
  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide();
}

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------

/** Apply dark keyboard style. Call once on app init. */
export async function initKeyboard() {
  if (!isNative) return;
  const { Keyboard, KeyboardStyle } = await import('@capacitor/keyboard');
  await Keyboard.setStyle({ style: KeyboardStyle.Dark });
}

export async function hideKeyboard() {
  if (!isNative) return;
  const { Keyboard } = await import('@capacitor/keyboard');
  await Keyboard.hide();
}

// ---------------------------------------------------------------------------
// Init — call once from your root layout or _app
// ---------------------------------------------------------------------------

/** Initialize all native plugins. Safe no-op on web. */
export async function initNative() {
  if (!isNative) return;
  await initStatusBar();
  await initKeyboard();
}
