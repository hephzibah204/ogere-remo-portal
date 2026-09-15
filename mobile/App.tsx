import React, { useEffect, useRef, Component, ErrorInfo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

// ──────────────────────────────────────────────────────────────────────────────
// Global Error Boundary — catches ANY unhandled JS error and shows a friendly
// recovery screen instead of crashing to the Android launcher.
// ──────────────────────────────────────────────────────────────────────────────
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
          <Text style={errorStyles.icon}>⚠️</Text>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.subtitle}>
            The app encountered an unexpected error. Please try again.
          </Text>
          <ScrollView style={errorStyles.detailsBox}>
            <Text style={errorStyles.detailsText}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
          </ScrollView>
          <TouchableOpacity style={errorStyles.retryBtn} onPress={this.handleRetry}>
            <Text style={errorStyles.retryText}>🔄 Retry</Text>
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
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#a7f3d0', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  detailsBox: { maxHeight: 100, width: '100%', backgroundColor: '#022c22', borderRadius: 8, padding: 12, marginBottom: 24 },
  detailsText: { fontSize: 12, color: '#6ee7b7', fontFamily: 'monospace' },
  retryBtn: { backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  retryText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});

// ──────────────────────────────────────────────────────────────────────────────
// Main App component — ALL initialization is wrapped in try/catch
// ──────────────────────────────────────────────────────────────────────────────

// Lazy imports so a missing module never crashes the root component
let AuthProvider: React.FC<{ children: React.ReactNode }> | null = null;
let AdminAuthProvider: React.FC<{ children: React.ReactNode }> | null = null;
let RootNavigator: React.ForwardRefExoticComponent<any> | null = null;

try {
  AuthProvider = require('./src/services/authContext').AuthProvider;
} catch (e) {
  console.warn('[App] Failed to load AuthProvider:', e);
}

try {
  AdminAuthProvider = require('./src/services/adminAuthContext').AdminAuthProvider;
} catch (e) {
  console.warn('[App] Failed to load AdminAuthProvider:', e);
}

try {
  RootNavigator = require('./src/navigation/RootNavigator').RootNavigator;
} catch (e) {
  console.warn('[App] Failed to load RootNavigator:', e);
}

function AppContent() {
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // 1. Initialize offline local storage with bundled seed data — SAFE
    (async () => {
      try {
        const { initOfflineStorage } = require('./src/database/sqlite');
        await initOfflineStorage();

        // 2. Trigger initial delta check if network is currently reachable
        try {
          const { syncManager } = require('./src/database/syncManager');
          if (syncManager.getOnlineStatus()) {
            syncManager.performDeltaSync().catch(() => {});
          }
        } catch (syncErr) {
          console.warn('[App] syncManager init failed safely:', syncErr);
        }
      } catch (dbErr) {
        console.warn('[App] Offline storage init failed safely:', dbErr);
      }
    })();

    // 3. Register for push notifications — SAFE (never crashes)
    (async () => {
      try {
        const push = require('./src/services/pushNotifications');
        // Initialize the notification handler first
        await push.initNotificationHandler();

        const token = await push.registerForPushNotifications();
        if (token) {
          push.sendTokenToServer(token, undefined, 'citizen');
        }
      } catch (pushErr) {
        console.warn('[App] Push notification setup failed safely:', pushErr);
      }
    })();

    // 4. Subscribe to notification events for the lifetime of the app — SAFE
    let unsubscribe = () => {};
    try {
      const push = require('./src/services/pushNotifications');
      unsubscribe = push.subscribeToNotifications(
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
    } catch (subErr) {
      console.warn('[App] Notification subscription failed safely:', subErr);
    }

    return () => {
      try { unsubscribe(); } catch {}
    };
  }, []);

  // If critical providers failed to load, show a fallback
  if (!RootNavigator) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#064e3b' }}>
        <Text style={{ color: '#ffffff', fontSize: 18 }}>Loading Ogere Remo...</Text>
      </View>
    );
  }

  const content = <RootNavigator ref={navigationRef} />;

  // Wrap in providers — each one is optional and skipped if it failed to load
  let wrapped = content;
  if (AdminAuthProvider) {
    wrapped = <AdminAuthProvider>{wrapped}</AdminAuthProvider>;
  }
  if (AuthProvider) {
    wrapped = <AuthProvider>{wrapped}</AuthProvider>;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {wrapped}
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
