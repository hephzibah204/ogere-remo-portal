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
        body: JSON.stringify({ identifier, password: pass }),
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

      try {
        await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, data.token);
      } catch {
        await AsyncStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      }

      await AsyncStorage.setItem(ADMIN_OFFICER_KEY, JSON.stringify(officerObj));

      setToken(data.token);
      setOfficer(officerObj);
      setActiveRole(officerObj.role);

      return { success: true };
    } catch (err: any) {
      // Local demo fallback for offline or development credentials
      if (identifier === 'police@ogereremo.org' || identifier === 'NPF-OG-4891') {
        const demoOfficer: OfficerUser = {
          id: 'usr_sec_demo',
          fullName: 'ASP Babatunde Oladipo',
          email: 'police@ogereremo.org',
          phone: '08031112233',
          role: 'security_officer',
          agencyName: 'Nigeria Police Force (Ogere Divisional Command)',
          badgeNumber: 'NPF-OG-4891',
          isOfficerVerified: true,
          isVerified: true,
        };
        setOfficer(demoOfficer);
        setActiveRole('security_officer');
        setToken('demo_sec_token');
        await AsyncStorage.setItem(ADMIN_OFFICER_KEY, JSON.stringify(demoOfficer));
        return { success: true };
      }

      if (identifier === 'protocol@ogereremo.org' || identifier === 'PAL-PRO-002') {
        const demoOfficer: OfficerUser = {
          id: 'usr_pal_demo',
          fullName: 'Chief Adebisi Adeleke',
          email: 'protocol@ogereremo.org',
          phone: '08032223344',
          role: 'palace_protocol',
          agencyName: 'Aafin Ologere Protocol Secretariat',
          badgeNumber: 'PAL-PRO-002',
          isOfficerVerified: true,
          isVerified: true,
        };
        setOfficer(demoOfficer);
        setActiveRole('palace_protocol');
        setToken('demo_pal_token');
        await AsyncStorage.setItem(ADMIN_OFFICER_KEY, JSON.stringify(demoOfficer));
        return { success: true };
      }

      if (identifier === 'admin@ogereremo.org' || identifier === 'OCDA-ADM-101') {
        const demoOfficer: OfficerUser = {
          id: 'usr_adm_demo',
          fullName: 'Engr. Olufemi Balogun',
          email: 'admin@ogereremo.org',
          phone: '08033334455',
          role: 'ocda_admin',
          agencyName: 'Ogere Community Development Association (OCDA)',
          badgeNumber: 'OCDA-ADM-101',
          isOfficerVerified: true,
          isVerified: true,
        };
        setOfficer(demoOfficer);
        setActiveRole('ocda_admin');
        setToken('demo_adm_token');
        await AsyncStorage.setItem(ADMIN_OFFICER_KEY, JSON.stringify(demoOfficer));
        return { success: true };
      }

      return { success: false, error: err.message || 'Network connection failed.' };
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

      try {
        await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, resData.token);
      } catch {
        await AsyncStorage.setItem(ADMIN_TOKEN_KEY, resData.token);
      }

      await AsyncStorage.setItem(ADMIN_OFFICER_KEY, JSON.stringify(officerObj));

      setToken(resData.token);
      setOfficer(officerObj);
      setActiveRole(officerObj.role);

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
      return res.success;
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
