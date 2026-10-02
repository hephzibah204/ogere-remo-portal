import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSession } from '../services/auth';

const AuthContext = createContext({
  user: null,
  loading: true,
  setAuthUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // 1. Initial Load
    getSession().then((sessionUser) => {
      if (mounted) {
        setUser(sessionUser);
        setLoading(false);
      }
    });

    // 2. Listen to custom event for login/logout actions across the app
    const handleAuthChange = (e) => {
      setUser(e.detail);
    };
    window.addEventListener('ogere-auth-changed', handleAuthChange);

    // 3. Listen to cross-tab storage changes (if another tab logs out)
    const handleStorageChange = (e) => {
      if (e.key === 'ogere_user' || e.key === 'session') {
        getSession().then((sessionUser) => {
          if (mounted) setUser(sessionUser);
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      window.removeEventListener('ogere-auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setAuthUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
