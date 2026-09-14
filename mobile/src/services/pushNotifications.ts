/**
 * pushNotifications.ts
 * Ogere Remo Civic App — Push Notification Service
 *
 * Registers device for Expo Push Notifications and sends the token to the backend
 * so the server can push CODE_RED emergency alerts even when the app is in background.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../database/syncManager';

// ──────────────────────────────────────────────────────────────────────────────
// Configure how foreground notifications behave
// ──────────────────────────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isEmergency = notification.request.content.data?.isEmergency === true;
    return {
      shouldShowAlert: true,
      shouldPlaySound: isEmergency,   // Play sound for CODE_RED emergencies
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// ──────────────────────────────────────────────────────────────────────────────
// Register for push notifications, request permission, return Expo Push Token
// ──────────────────────────────────────────────────────────────────────────────
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications only work on physical devices
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
    await Notifications.setNotificationChannelAsync('emergency', {
      name: '🚨 Emergency Alerts',
      description: 'CODE RED — Armed robbery, terrorism, and kidnapping alerts',
      importance: Notifications.AndroidImportance.MAX,   // Heads-up notification
      vibrationPattern: [0, 250, 100, 250, 100, 250],
      lightColor: '#ef4444',
      sound: 'default',
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,   // Bypass Do Not Disturb for life-safety alerts
    });

    await Notifications.setNotificationChannelAsync('general', {
      name: 'Ogere Civic Alerts',
      description: 'Palace proclamations, civic announcements, and community news',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  // Get the Expo Push Token
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    'ogere-remo-civic'; // fallback for dev

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[Push] Registered with token:', token);
    return token;
  } catch (err) {
    console.error('[Push] Failed to get push token:', err);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Register the push token with the Ogere backend API
// The backend will use this to push CODE_RED alerts via Expo Push API
// ──────────────────────────────────────────────────────────────────────────────
export async function sendTokenToServer(
  expoPushToken: string,
  userId?: string,
  role?: string  // 'security_agent' | 'citizen'
): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/push-tokens`, {
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
    // Non-fatal — token registration failure should not block the app
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
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
      color: '#ef4444',
      data: { isEmergency: true, ...data },
    },
    trigger: null, // Show immediately
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Subscribe to incoming notifications (foreground + tap handlers)
// Call this once in App.tsx and clean up on unmount
// ──────────────────────────────────────────────────────────────────────────────
export function subscribeToNotifications(
  onForeground: (notification: Notifications.Notification) => void,
  onTap: (response: Notifications.NotificationResponse) => void
): () => void {
  const foregroundSub = Notifications.addNotificationReceivedListener(onForeground);
  const tapSub = Notifications.addNotificationResponseReceivedListener(onTap);

  return () => {
    foregroundSub.remove();
    tapSub.remove();
  };
}
