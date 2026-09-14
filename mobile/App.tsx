import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/services/authContext';
import { AdminAuthProvider } from './src/services/adminAuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initOfflineStorage } from './src/database/sqlite';
import { syncManager } from './src/database/syncManager';
import {
  registerForPushNotifications,
  sendTokenToServer,
  subscribeToNotifications,
} from './src/services/pushNotifications';

export default function App() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // 1. Initialize offline local storage with bundled seed data
    initOfflineStorage().then(() => {
      // 2. Trigger initial delta check if network is currently reachable
      if (syncManager.getOnlineStatus()) {
        syncManager.performDeltaSync().catch(() => {});
      }
    });

    // 3. Register for push notifications and send token to server
    registerForPushNotifications().then(token => {
      if (token) {
        // Send to backend — role 'citizen' by default;
        // Security agents can update their role in profile settings
        sendTokenToServer(token, undefined, 'citizen');
      }
    });

    // 4. Subscribe to notification events for the lifetime of the app
    const unsubscribe = subscribeToNotifications(
      // Foreground notification received — app is open
      (notification) => {
        const data = notification.request.content.data as any;
        console.log('[App] Foreground notification:', data);
      },
      // User tapped a notification — navigate to relevant screen
      (response) => {
        const data = response.notification.request.content.data as any;
        if (data?.screen === 'SecurityDashboard' && navigationRef.current) {
          navigationRef.current.navigate('SecurityDashboard');
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <StatusBar style="light" />
          <RootNavigator ref={navigationRef} />
        </AdminAuthProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
