import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../database/syncManager';

export interface CitizenIdCard {
  id: string;
  fullName: string;
  cardType: 'indigene' | 'non-indigene' | 'guest';
  subCategoryLabel?: string;
  locationSummary?: string;
  indigeneResidency?: 'ogere' | 'diaspora' | 'nigeria' | null;
  quarter?: string;
  compound?: string;
  guestInterest?: string | null;
  status: string;
  issuedDate: string;
  expiryDate: string;
  verifiedBy: string;
  qrCodeUrl: string;
}

export interface CitizenUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  citizenType: 'indigene' | 'non-indigene' | 'guest';
  subCategoryLabel?: string;
  locationSummary?: string;
  indigeneResidency?: 'ogere' | 'diaspora' | 'nigeria' | null;
  diasporaCountry?: string | null;
  diasporaCity?: string | null;
  nigeriaState?: string | null;
  nigeriaCity?: string | null;
  guestInterest?: string | null;
  quarter?: string;
  compound?: string;
  idCardNumber?: string;
  role: string;
  isVerified: boolean;
  idCard?: CitizenIdCard | null;
}

interface AuthContextType {
  user: CitizenUser | null;
  token: string | null;
  isLoading: boolean;
  isGuest: boolean;
  hasBiometrics: boolean;
  setGuestMode: (enabled: boolean) => void;
  signIn: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    citizenType: 'indigene' | 'non-indigene' | 'guest';
    indigeneResidency?: 'ogere' | 'diaspora' | 'nigeria';
    diasporaCountry?: string;
    diasporaCity?: string;
    nigeriaState?: string;
    nigeriaCity?: string;
    quarter?: string;
    compound?: string;
    address?: string;
    occupation?: string;
    guestInterest?: string;
    cityCountry?: string;
    organization?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  authenticateWithBiometrics: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const TOKEN_KEY = 'ogere_auth_token';
const USER_KEY = 'ogere_auth_user';
const BIOMETRIC_TOKEN_KEY = 'ogere_bio_token';
const BIOMETRIC_USER_KEY = 'ogere_bio_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CitizenUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    bootstrapAuth();
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometrics(compatible && enrolled);
    } catch {
      setHasBiometrics(false);
    }
  };

  const syncOfflineRegistrations = async () => {
    try {
      const rawOffline = await AsyncStorage.getItem('ogere_offline_users');
      if (!rawOffline) return;
      const offlineList: any[] = JSON.parse(rawOffline);
      const unsynced = offlineList.filter((u) => !u.syncedToCloud && u.password);
      if (unsynced.length === 0) return;

      let changed = false;
      for (const item of unsynced) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          });
          if (res.ok || res.status === 409) {
            item.syncedToCloud = true;
            changed = true;
          }
        } catch (_) {}
      }
      if (changed) {
        await AsyncStorage.setItem('ogere_offline_users', JSON.stringify(offlineList));
      }
    } catch (_) {}
  };

  const bootstrapAuth = async () => {
    try {
      let savedToken: string | null = null;
      try {
        savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      } catch {
        savedToken = await AsyncStorage.getItem(TOKEN_KEY);
      }

      const savedUser = await AsyncStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);

        // Live profile synchronization with Neon PostgreSQL backend (with 3.5s timeout)
        const syncCtrl = new AbortController();
        const syncTimeout = setTimeout(() => syncCtrl.abort(), 3500);

        fetch(`${API_BASE_URL}/api/auth?action=me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
          signal: syncCtrl.signal,
        })
          .then((r) => r.json())
          .then(async (data) => {
            clearTimeout(syncTimeout);
            if (data && data.success && data.user) {
              setUser(data.user);
              await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
          })
          .catch(() => {
            clearTimeout(syncTimeout);
          });
      }

      syncOfflineRegistrations();
    } catch (err) {
      console.error('[Auth] Bootstrap failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setGuestMode = (enabled: boolean) => {
    setIsGuest(enabled);
  };

  const persistSession = async (authToken: string, authUser: CitizenUser) => {
    setToken(authToken);
    setUser(authUser);
    setIsGuest(false);

    try {
      await SecureStore.setItemAsync(TOKEN_KEY, authToken);
      await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, authToken);
    } catch {
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      await AsyncStorage.setItem(BIOMETRIC_TOKEN_KEY, authToken);
    }
    const userJson = JSON.stringify(authUser);
    await AsyncStorage.setItem(USER_KEY, userJson);
    await AsyncStorage.setItem(BIOMETRIC_USER_KEY, userJson);
  };

  const signIn = async (identifier: string, pass: string) => {
    const cleanIdent = (identifier || '').trim().toLowerCase();
    const cleanPhone = cleanIdent.replace(/\D/g, '');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanIdent, password: pass }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed. Please check your credentials.' };
      }

      await persistSession(data.token, data.user);
      return { success: true };
    } catch (err: any) {
      // Offline fallback authentication for accounts registered while offline
      try {
        const rawOffline = await AsyncStorage.getItem('ogere_offline_users');
        const offlineUsers: any[] = rawOffline ? JSON.parse(rawOffline) : [];

        const found = offlineUsers.find(u => {
          const uEmail = (u.email || '').toLowerCase().trim();
          const uPhone = (u.phone || '').replace(/\D/g, '');
          const uCard = (u.idCardNumber || '').toLowerCase().trim();
          const matches = uEmail === cleanIdent || (cleanPhone && uPhone === cleanPhone) || uCard === cleanIdent;
          return matches && u.password === pass;
        });

        if (found) {
          const { password: _, ...cleanUser } = found;
          const offlineToken = 'offline_jwt_' + Date.now();
          await persistSession(offlineToken, cleanUser);
          return { success: true };
        }
      } catch (_) {}

      return { success: false, error: 'Unable to connect to server. Please check your credentials or internet connection.' };
    }
  };

  const signUp = async (formData: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data && data.success) {
        await persistSession(data.token, data.user);
        return { success: true };
      }

      if (data && data.error) {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      console.warn('[Auth] Remote registration unreachable, queueing offline registration for sync...');
    }

    // Offline registration fallback: immediate certified Digital ID generation
    const randNum = Math.floor(100000 + Math.random() * 900000);
    let cardPrefix = 'OGR-IND';
    let locationSummary = '';
    let subCategoryLabel = '';

    if (formData.citizenType === 'indigene') {
      if (formData.indigeneResidency === 'diaspora') {
        cardPrefix = 'OGR-IND-INT';
        locationSummary = `Diaspora (${formData.diasporaCity ? formData.diasporaCity + ', ' : ''}${formData.diasporaCountry || 'International'})`;
        subCategoryLabel = 'Indigene Â· Diaspora';
      } else if (formData.indigeneResidency === 'nigeria') {
        cardPrefix = 'OGR-IND-NG';
        locationSummary = `Nigeria (${formData.nigeriaCity ? formData.nigeriaCity + ', ' : ''}${formData.nigeriaState || 'Interstate'})`;
        subCategoryLabel = 'Indigene Â· In Nigeria';
      } else {
        cardPrefix = 'OGR-IND-OG';
        locationSummary = `Resident in Ogere (${formData.quarter || 'Oke-Ogere'})`;
        subCategoryLabel = 'Indigene Â· Resident in Ogere';
      }
    } else if (formData.citizenType === 'non-indigene') {
      cardPrefix = 'OGR-RES';
      locationSummary = formData.address ? `${formData.address}, Ogere` : `Resident in Ogere (${formData.quarter || 'Oke-Ogere'})`;
      subCategoryLabel = 'Non-Indigene Resident';
    } else {
      cardPrefix = 'OGR-GST';
      locationSummary = formData.cityCountry || 'External Supporter';
      subCategoryLabel = `Guest (${formData.guestInterest || 'Friend of Ogere'})`;
    }

    const cardId = `${cardPrefix}-${randNum}`;

    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 3 * 365 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const localUser: CitizenUser = {
      id: 'usr_' + Date.now().toString(36),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      citizenType: formData.citizenType,
      subCategoryLabel,
      locationSummary,
      indigeneResidency: formData.citizenType === 'indigene' ? formData.indigeneResidency : null,
      diasporaCountry: formData.diasporaCountry || null,
      diasporaCity: formData.diasporaCity || null,
      nigeriaState: formData.nigeriaState || null,
      nigeriaCity: formData.nigeriaCity || null,
      guestInterest: formData.guestInterest || null,
      quarter: formData.quarter || (formData.citizenType === 'guest' ? 'External' : 'Oke-Ogere'),
      compound: formData.compound || '',
      idCardNumber: cardId,
      role: formData.citizenType === 'guest' ? 'guest' : 'citizen',
      isVerified: true,
      idCard: {
        id: cardId,
        fullName: formData.fullName,
        cardType: formData.citizenType,
        subCategoryLabel,
        locationSummary,
        indigeneResidency: formData.citizenType === 'indigene' ? formData.indigeneResidency : null,
        quarter: formData.quarter || (formData.citizenType === 'guest' ? 'External' : 'Oke-Ogere'),
        compound: formData.compound || '',
        guestInterest: formData.guestInterest || null,
        status: 'approved',
        issuedDate: today,
        expiryDate: expiry,
        verifiedBy: 'HRH Ologere Palace ICT Registry',
        qrCodeUrl: `https://ogere-remo-portal.vercel.app/verify-id/${cardId}`,
      },
    };

    const offlineToken = 'offline_jwt_' + Date.now();
    await persistSession(offlineToken, localUser);

    try {
      const rawOffline = await AsyncStorage.getItem('ogere_offline_users');
      const offlineList: any[] = rawOffline ? JSON.parse(rawOffline) : [];
      offlineList.unshift({ ...localUser, password: formData.password, syncedToCloud: false });
      await AsyncStorage.setItem('ogere_offline_users', JSON.stringify(offlineList));
    } catch (_) {}

    return { success: true };
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    setIsGuest(true);
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    await AsyncStorage.removeItem(USER_KEY);
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (user?.id || token) {
        await fetch(`${API_BASE_URL}/api/auth?action=delete_account`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ action: 'delete_account', userId: user?.id }),
        }).catch(() => {});
      }
      try {
        await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY);
      } catch {
        await AsyncStorage.removeItem(BIOMETRIC_TOKEN_KEY);
      }
      await AsyncStorage.removeItem(BIOMETRIC_USER_KEY);
      await signOut();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to delete account' };
    }
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Ogere Civic Portal',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });
      if (!result.success) return false;

      let bioToken: string | null = null;
      try {
        bioToken = await SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
      } catch {
        bioToken = await AsyncStorage.getItem(BIOMETRIC_TOKEN_KEY);
      }
      const bioUser = await AsyncStorage.getItem(BIOMETRIC_USER_KEY);
      if (bioToken && bioUser) {
        await persistSession(bioToken, JSON.parse(bioUser));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isGuest,
        hasBiometrics,
        setGuestMode,
        signIn,
        signUp,
        signOut,
        deleteAccount,
        authenticateWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
