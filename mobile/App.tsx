import React, { useEffect, useRef, Component, ErrorInfo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { AuthProvider } from './src/services/authContext';
import { AdminAuthProvider } from './src/services/adminAuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initOfflineStorage } from './src/database/sqlite';
import { syncManager } from './src/database/syncManager';
import {
  initNotificationHandler,
  registerForPushNotifications,
  sendTokenToServer,
  subscribeToNotifications,
} from './src/services/pushNotifications';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.icon}>👑</Text>
          <Text style={errorStyles.title}>Ogere Remo Portal</Text>
          <Text style={errorStyles.subtitle}>
            Notice: An unexpected state occurred. Tap retry to restore the application.
          </Text>
          <ScrollView style={errorStyles.detailsBox}>
            <Text style={errorStyles.detailsText}>
              {this.state.error?.message || 'Application initialized.'}
            </Text>
          </ScrollView>
          <TouchableOpacity style={errorStyles.retryBtn} onPress={this.handleRetry}>
            <Text style={errorStyles.retryText}>🔄 Restore Portal</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#a7f3d0', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  detailsBox: { maxHeight: 90, width: '100%', backgroundColor: '#022c22', borderRadius: 8, padding: 12, marginBottom: 24 },
  detailsText: { fontSize: 12, color: '#6ee7b7', fontFamily: 'monospace' },
  retryBtn: { backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  retryText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});

function AppContent() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // 1. Initialize offline local storage with bundled seed data
    initOfflineStorage().then(() => {
      try {
        if (syncManager.getOnlineStatus()) {
          syncManager.performDeltaSync().catch(() => {});
        }
      } catch (e) {
        console.warn('[App] Sync check error:', e);
      }
    }).catch((err) => {
      console.warn('[App] Storage init error:', err);
    });

    // 2. Register for push notifications safely
    initNotificationHandler().then(() => {
      registerForPushNotifications().then((token) => {
        if (token) {
          sendTokenToServer(token, undefined, 'citizen');
        }
      }).catch((e) => console.warn('[App] Push token error:', e));
    });

    // 3. Subscribe to notification events for the lifetime of the app
    const unsubscribe = subscribeToNotifications(
      (notification: any) => {
        const data = notification?.request?.content?.data;
        console.log('[App] Foreground notification:', data);
      },
      (response: any) => {
        const data = response?.notification?.request?.content?.data;
        if (data?.screen === 'SecurityDashboard' && navigationRef.current) {
          navigationRef.current.navigate('SecurityDashboard');
        }
      }
    );

    return () => {
      try { unsubscribe(); } catch {}
    };
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

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AppContent />
    </GlobalErrorBoundary>
  );
}
