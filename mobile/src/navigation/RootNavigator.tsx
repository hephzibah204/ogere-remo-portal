import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../services/authContext';
import { Colors } from '../theme';

// Screens
import { WelcomeScreen } from '../screens/welcome/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { NewsScreen } from '../screens/news/NewsScreen';
import { NewsDetailScreen } from '../screens/news/NewsDetailScreen';
import { HeritageScreen } from '../screens/heritage/HeritageScreen';
import { DirectoryScreen } from '../screens/directory/DirectoryScreen';
import { ServicesScreen } from '../screens/services/ServicesScreen';
import { VerifyIdScreen } from '../screens/services/VerifyIdScreen';
import { RoyalAudienceScreen } from '../screens/services/RoyalAudienceScreen';
import { IncidentReportScreen } from '../screens/services/IncidentReportScreen';
import { SecurityDashboardScreen } from '../screens/services/SecurityDashboardScreen';
import { WalkWithMeScreen } from '../screens/services/WalkWithMeScreen';
import { EmergencyContactsScreen } from '../screens/services/EmergencyContactsScreen';
import { WhistleblowerScreen } from '../screens/services/WhistleblowerScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
    <Text style={{ fontSize: 18 }}>{emoji}</Text>
  </View>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="🏛️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="NewsTab"
        component={NewsScreen}
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="📰" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SosTab"
        component={IncidentReportScreen}
        options={{
          tabBarLabel: 'SOS 🚨',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && { backgroundColor: '#fee2e2' }]}>
              <Text style={{ fontSize: 19 }}>🚨</Text>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '900',
            color: '#dc2626',
          },
        }}
      />
      <Tab.Screen
        name="HeritageTab"
        component={HeritageScreen}
        options={{
          tabBarLabel: 'Heritage',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="👑" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesScreen}
        options={{
          tabBarLabel: 'Services',
          tabBarIcon: ({ focused }) => <TabBarIcon emoji="⚡" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>👑</Text>
        <Text style={styles.loadingTitle}>OGERE REMO CIVIC PORTAL</Text>
        <Text style={styles.loadingSub}>Loading Local Offline Registry...</Text>
      </View>
    );
  }

  const initialRoute = user || isGuest ? 'Main' : 'Welcome';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
        <Stack.Screen name="VerifyId" component={VerifyIdScreen} />
        <Stack.Screen name="RoyalAudience" component={RoyalAudienceScreen} />
        <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
        <Stack.Screen name="SecurityDashboard" component={SecurityDashboardScreen} />
        <Stack.Screen name="WalkWithMe" component={WalkWithMeScreen} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
        <Stack.Screen name="Whistleblower" component={WhistleblowerScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFocused: {
    backgroundColor: Colors.primaryMuted,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  loadingSub: {
    color: '#a7f3d0',
    fontSize: 12,
    marginTop: 4,
  },
});
