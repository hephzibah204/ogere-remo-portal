import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../database/syncManager';

export type OfficerRole = 'security_officer' | 'palace_protocol' | 'ocda_admin' | 'super_admin';

export interface OfficerUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: OfficerRole;
  agencyName: string;
  badgeNumber: string;
  isOfficerVerified: boolean;
  isVerified: boolean;
  avatarUrl?: string;
}

interface AdminAuthContextType {
  officer: OfficerUser | null;
  token: string | null;
  isLoading: boolean;
  hasBiometrics: boolean;
  activeRole: OfficerRole | null;
  signInOfficer: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpOfficer: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: OfficerRole;
    agencyName: string;
    badgeNumber: string;
    agencyAccessKey: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOutOfficer: () => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  switchDutyRole: (role: OfficerRole) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({} as AdminAuthContextType);

const ADMIN_TOKEN_KEY = 'ogere_admin_token';
const ADMIN_OFFICER_KEY = 'ogere_admin_officer';
const ADMIN_BIO_TOKEN_KEY = 'ogere_admin_bio_token';
const ADMIN_BIO_OFFICER_KEY = 'ogere_admin_bio_officer';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [officer, setOfficer] = useState<OfficerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [activeRole, setActiveRole] = useState<OfficerRole | null>(null);

  useEffect(() => {
    bootstrapAdminAuth();
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

  const persistOfficerSession = async (authToken: string, officerObj: OfficerUser) => {
    try {
      await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, authToken);
      await SecureStore.setItemAsync(ADMIN_BIO_TOKEN_KEY, authToken);
    } catch {
      await AsyncStorage.setItem(ADMIN_TOKEN_KEY, authToken);
      await AsyncStorage.setItem(ADMIN_BIO_TOKEN_KEY, authToken);
    }
    const officerJson = JSON.stringify(officerObj);
    await AsyncStorage.setItem(ADMIN_OFFICER_KEY, officerJson);
    await AsyncStorage.setItem(ADMIN_BIO_OFFICER_KEY, officerJson);

    setToken(authToken);
    setOfficer(officerObj);
    setActiveRole(officerObj.role);
  };

  const bootstrapAdminAuth = async () => {
    try {
      let savedToken: string | null = null;
      let savedOfficerStr: string | null = null;

      try {
        savedToken = await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
      } catch {
        savedToken = await AsyncStorage.getItem(ADMIN_TOKEN_KEY);
      }

      savedOfficerStr = await AsyncStorage.getItem(ADMIN_OFFICER_KEY);

      if (savedToken && savedOfficerStr) {
        const parsedOfficer: OfficerUser = JSON.parse(savedOfficerStr);
        setToken(savedToken);
        setOfficer(parsedOfficer);
        setActiveRole(parsedOfficer.role);

        // Verify and synchronize officer credentials with live PostgreSQL database
        fetch(`${API_BASE_URL}/api/auth?action=me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((r) => r.json())
          .then(async (data) => {
            if (data && data.success && data.user) {
              const role = data.user.role === 'admin' ? 'ocda_admin' : data.user.role;
              const syncedOfficer: OfficerUser = {
                id: data.user.id,
                fullName: data.user.fullName,
                email: data.user.email,
                phone: data.user.phone,
                role,
                agencyName: data.user.agencyName || parsedOfficer.agencyName,
                badgeNumber: data.user.badgeNumber || parsedOfficer.badgeNumber,
                isOfficerVerified: Boolean(data.user.isOfficerVerified ?? true),
                isVerified: Boolean(data.user.isVerified),
              };
              setOfficer(syncedOfficer);
              setActiveRole(syncedOfficer.role);
              await AsyncStorage.setItem(ADMIN_OFFICER_KEY, JSON.stringify(syncedOfficer));
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.warn('[AdminAuthContext] Bootstrap error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signInOfficer = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password: pass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Officer login failed. Check credentials.' };
      }

      const role = data.user?.role;
      const validOfficerRoles: OfficerRole[] = ['security_officer', 'palace_protocol', 'ocda_admin', 'super_admin', 'admin' as any];

      if (!validOfficerRoles.includes(role)) {
        return {
          success: false,
          error: 'This citizen account does not have Field Officer, Protocol, or Administrator clearance.',
        };
      }

      const officerObj: OfficerUser = {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone,
        role: role === 'admin' ? 'ocda_admin' : role,
        agencyName: data.user.agencyName || (role === 'palace_protocol' ? 'Palace Protocol Unit' : role === 'security_officer' ? 'Joint Security Patrol' : 'OCDA Central Command'),
        badgeNumber: data.user.badgeNumber || `OG-${data.user.id.substring(4, 9).toUpperCase()}`,
        isOfficerVerified: Boolean(data.user.isOfficerVerified ?? true),
        isVerified: Boolean(data.user.isVerified),
      };

      await persistOfficerSession(data.token, officerObj);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Unable to reach Ogere Security Command Server. Please check your internet connection.' };
    }
  };

  const signUpOfficer = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: OfficerRole;
    agencyName: string;
    badgeNumber: string;
    agencyAccessKey: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          accountType: 'officer',
          citizenType: 'officer',
        }),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Registration failed.' };
      }

      const officerObj: OfficerUser = {
        id: resData.user.id,
        fullName: resData.user.fullName,
        email: resData.user.email,
        phone: resData.user.phone,
        role: data.role,
        agencyName: data.agencyName,
        badgeNumber: data.badgeNumber,
        isOfficerVerified: true,
        isVerified: true,
      };

      await persistOfficerSession(resData.token, officerObj);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network connection failed.' };
    }
  };

  const signOutOfficer = async () => {
    try {
      try {
        await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY);
      } catch {
        await AsyncStorage.removeItem(ADMIN_TOKEN_KEY);
      }
      await AsyncStorage.removeItem(ADMIN_OFFICER_KEY);
    } catch {}

    setOfficer(null);
    setToken(null);
    setActiveRole(null);
  };

  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Officer Identity Verification',
        fallbackLabel: 'Use Badge & Password',
      });
      if (!res.success) return false;

      let bioToken: string | null = null;
      try {
        bioToken = await SecureStore.getItemAsync(ADMIN_BIO_TOKEN_KEY);
      } catch {
        bioToken = await AsyncStorage.getItem(ADMIN_BIO_TOKEN_KEY);
      }
      const bioOfficer = await AsyncStorage.getItem(ADMIN_BIO_OFFICER_KEY);
      if (bioToken && bioOfficer) {
        await persistOfficerSession(bioToken, JSON.parse(bioOfficer));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const switchDutyRole = (role: OfficerRole) => {
    setActiveRole(role);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        officer,
        token,
        isLoading,
        hasBiometrics,
        activeRole,
        signInOfficer,
        signUpOfficer,
        signOutOfficer,
        authenticateWithBiometrics,
        switchDutyRole,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
