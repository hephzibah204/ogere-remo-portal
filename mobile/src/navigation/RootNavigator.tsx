import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../services/authContext';
import { Colors } from '../theme';

// Screens
import { WelcomeScreen } from '../screens/welcome/WelcomeScreen';
import { SplashScreen } from '../screens/welcome/SplashScreen';
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
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MapScreen } from '../screens/map/MapScreen';
import { DonationScreen } from '../screens/donation/DonationScreen';
import { MarketplaceScreen } from '../screens/marketplace/MarketplaceScreen';
import { LandRegistryScreen } from '../screens/services/LandRegistryScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { TrackIncidentScreen } from '../screens/services/TrackIncidentScreen';
import { ForumScreen } from '../screens/community/ForumScreen';

// Field Officer & Admin Terminal Screens
import { AdminLoginScreen } from '../screens/admin/AdminLoginScreen';
import { AdminRegisterScreen } from '../screens/admin/AdminRegisterScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminAudienceManagerScreen } from '../screens/admin/AdminAudienceManagerScreen';
import { AdminIdApprovalScreen } from '../screens/admin/AdminIdApprovalScreen';

import * as Application from 'expo-application';
import Constants from 'expo-constants';

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

export const RootNavigator = React.forwardRef<any, any>((props, ref) => {
  const { user, isGuest, isLoading } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);
  const appId = Application.applicationId || '';
  const appVariant = Constants.expoConfig?.extra?.appVariant || (appId.includes('officer') ? 'officer' : 'citizen');
  const isOfficerApp = appVariant === 'officer' || appId.includes('officer');

  // Display Splash Screen until auth/registry is ready or splash timer finishes
  if (showSplash || isLoading) {
    return (
      <SplashScreen
        isOfficerApp={isOfficerApp}
        onFinish={() => {
          if (!isLoading) {
            setShowSplash(false);
          }
        }}
      />
    );
  }

  const initialRoute = isOfficerApp 
    ? 'AdminLogin' 
    : (user || isGuest ? 'Main' : 'Welcome');

  return (
    <NavigationContainer ref={ref}>
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
        <Stack.Screen name="Directory" component={DirectoryScreen} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Donation" component={DonationScreen} />
        <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="LandRegistry" component={LandRegistryScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="TrackIncident" component={TrackIncidentScreen} />
        <Stack.Screen name="Forum" component={ForumScreen} />

        {/* Admin & Field Officer Terminal Screens */}
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminRegister" component={AdminRegisterScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminAudienceManager" component={AdminAudienceManagerScreen} />
        <Stack.Screen name="AdminIdApproval" component={AdminIdApprovalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
});

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
