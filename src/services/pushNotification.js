/**
 * Ogere Remo Civic Portal - Push & Browser Notification Engine
 * Manages notification permissions, sound triggers, and in-app/system alerts.
 */

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('[Notification] Permission request failed:', err);
    return false;
  }
}

export function sendEscortNotification(title, body, options = {}) {
  // 1. Try native Web Notification
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options.tag || 'ogere-escort-alert',
        renotify: true,
        vibrate: [200, 100, 200],
        ...options,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (err) {
      console.warn('[Notification] Native push failed, fallback active:', err);
    }
  }

  // 2. Dispatch custom in-app notification event
  window.dispatchEvent(
    new CustomEvent('ogere-inapp-notification', {
      detail: { title, body, timestamp: Date.now(), ...options },
    })
  );
}
