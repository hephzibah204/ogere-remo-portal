/**
 * pushNotifications.ts
 * Ogere Remo Civic App — Push Notification Service
 *
 * Registers device for Expo Push Notifications and sends the token to the backend
 * so the server can push CODE_RED emergency alerts even when the app is in background.
 *
 * IMPORTANT: Every call is wrapped in try/catch because:
 * - Standalone APKs without google-services.json will crash Firebase Messaging
 * - Devices without Google Play Services will throw native exceptions
 * - Missing EAS projectId will cause getExpoPushTokenAsync to fail
 * None of these should prevent the app from starting.
 */

import { Platform } from 'react-native';

// Lazy-load notification modules to prevent top-level crashes
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;
let Constants: typeof import('expo-constants').default | null = null;

let API_BASE_URL_CACHED: string | null = null;

function getApiBaseUrl(): string {
  if (!API_BASE_URL_CACHED) {
    try {
      // Dynamic require to avoid circular dependency crashes
      const syncMod = require('../database/syncManager');
      API_BASE_URL_CACHED = syncMod.API_BASE_URL || 'https://ogereremo.vercel.app';
    } catch {
      API_BASE_URL_CACHED = 'https://ogereremo.vercel.app';
    }
  }
  return API_BASE_URL_CACHED || 'https://ogereremo.vercel.app';
}

async function loadModules(): Promise<boolean> {
  try {
    if (!Notifications) {
      Notifications = require('expo-notifications');
    }
    if (!Device) {
      Device = require('expo-device');
    }
    if (!Constants) {
      Constants = require('expo-constants').default || require('expo-constants');
    }
    return true;
  } catch (err) {
    console.warn('[Push] Failed to load notification modules:', err);
    return false;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Configure how foreground notifications behave
// Called lazily from initNotificationHandler() instead of top-level
// ──────────────────────────────────────────────────────────────────────────────
let handlerInitialized = false;

export async function initNotificationHandler(): Promise<void> {
  if (handlerInitialized) return;
  try {
    const loaded = await loadModules();
    if (!loaded || !Notifications) return;

    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const isEmergency = notification.request.content.data?.isEmergency === true;
        return {
          shouldShowAlert: true,
          shouldPlaySound: isEmergency,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });
    handlerInitialized = true;
  } catch (err) {
    console.warn('[Push] Failed to set notification handler:', err);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Register for push notifications, request permission, return Expo Push Token
// ──────────────────────────────────────────────────────────────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const loaded = await loadModules();
    if (!loaded || !Notifications || !Device) return null;

    if (!Device.isDevice) {
      console.warn('[Push] Push notifications require a physical device.');
      return null;
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Push] Push notification permission denied by user.');
      return null;
    }

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('emergency', {
          name: '🚨 Emergency Alerts',
          description: 'CODE RED — Armed robbery, terrorism, and kidnapping alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 100, 250, 100, 250],
          lightColor: '#ef4444',
          sound: 'default',
          enableVibrate: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: true,
        });

        await Notifications.setNotificationChannelAsync('general', {
          name: 'Ogere Civic Alerts',
          description: 'Palace proclamations, civic announcements, and community news',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      } catch (channelErr) {
        console.warn('[Push] Failed to create notification channels:', channelErr);
      }
    }

    // Get the Expo Push Token
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId ??
      'ogere-remo-civic';

    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log('[Push] Registered with token:', token);
      return token;
    } catch (tokenErr) {
      console.warn('[Push] Failed to get push token (missing Firebase/Google Services?):', tokenErr);
      return null;
    }
  } catch (err) {
    console.warn('[Push] registerForPushNotifications failed safely:', err);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Register the push token with the Ogere backend API
// ──────────────────────────────────────────────────────────────────────────────
export async function sendTokenToServer(
  expoPushToken: string,
  userId?: string,
  role?: string
): Promise<void> {
  try {
    await fetch(`${getApiBaseUrl()}/api/push-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: expoPushToken,
        userId: userId ?? 'anonymous',
        role: role ?? 'citizen',
        platform: Platform.OS,
        registeredAt: new Date().toISOString(),
      }),
    });
    console.log('[Push] Token registered with Ogere server.');
  } catch (err) {
    console.warn('[Push] Could not register token with server:', err);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Schedule a local notification (used when app is in foreground and CODE_RED arrives)
// ──────────────────────────────────────────────────────────────────────────────
export async function showLocalEmergencyNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    const loaded = await loadModules();
    if (!loaded || !Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#ef4444',
        data: { isEmergency: true, ...data },
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[Push] Failed to show local emergency notification:', err);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Subscribe to incoming notifications (foreground + tap handlers)
// Call this once in App.tsx and clean up on unmount
// ──────────────────────────────────────────────────────────────────────────────
export function subscribeToNotifications(
  onForeground: (notification: any) => void,
  onTap: (response: any) => void
): () => void {
  try {
    // Synchronous require — if it fails, return a no-op cleanup
    const NotifModule = require('expo-notifications');
    const foregroundSub = NotifModule.addNotificationReceivedListener(onForeground);
    const tapSub = NotifModule.addNotificationResponseReceivedListener(onTap);

    return () => {
      try {
        foregroundSub.remove();
        tapSub.remove();
      } catch {}
    };
  } catch (err) {
    console.warn('[Push] subscribeToNotifications failed safely:', err);
    return () => {};
  }
}
