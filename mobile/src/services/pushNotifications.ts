import { Platform, Alert, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../database/syncManager';

const PUSH_TOKEN_STORAGE_KEY = '@ogere_device_push_token';

type NotificationListener = (notification: any) => void;
type ResponseListener = (response: any) => void;

const notificationListeners = new Set<NotificationListener>();
const responseListeners = new Set<ResponseListener>();

export async function initNotificationHandler(): Promise<void> {}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    let token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (!token) {
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      token = `OGERE_DEVICE_${Platform.OS.toUpperCase()}_${randomSuffix}`;
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    }
    return token;
  } catch (err) {
    console.warn('[Push] registerForPushNotifications fallback error:', err);
    return null;
  }
}

export async function sendTokenToServer(
  expoPushToken: string,
  userId?: string,
  role?: string
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
    console.warn('[Push] Could not register token with server:', err);
  }
}

export async function showLocalEmergencyNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    Vibration.vibrate([0, 300, 150, 300]);

    const notificationObj = {
      request: {
        content: {
          title,
          body,
          data: { isEmergency: true, ...data },
        },
      },
    };

    notificationListeners.forEach((fn) => {
      try {
        fn(notificationObj);
      } catch (e) {
        console.warn('[Push] Listener notification error:', e);
      }
    });

    Alert.alert(`🚨 ${title}`, body, [
      {
        text: 'View Incident',
        onPress: () => {
          responseListeners.forEach((fn) => {
            try {
              fn({ notification: notificationObj });
            } catch (e) {
              console.warn('[Push] Response listener error:', e);
            }
          });
        },
      },
      { text: 'Dismiss', style: 'cancel' },
    ]);
  } catch (err) {
    console.warn('[Push] Failed to show emergency notification:', err);
  }
}

export function subscribeToNotifications(
  onForeground: (notification: any) => void,
  onTap: (response: any) => void
): () => void {
  notificationListeners.add(onForeground);
  responseListeners.add(onTap);

  return () => {
    notificationListeners.delete(onForeground);
    responseListeners.delete(onTap);
  };
}
