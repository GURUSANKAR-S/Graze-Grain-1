'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthUser {
  email: string;
  sub: string;
  role: string;
  exp?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const isTokenValid = (decoded: AuthUser) => {
    if (!decoded.exp) {
      return true;
    }
    return decoded.exp > Math.floor(Date.now() / 1000);
  };

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('accessToken');
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      return null;
    }

    try {
      const decoded = jwtDecode<AuthUser>(storedToken);
      if (!isTokenValid(decoded)) {
        localStorage.removeItem('accessToken');
        return null;
      }
      return decoded;
    } catch {
      localStorage.removeItem('accessToken');
      return null;
    }
  });

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<AuthUser>(newToken);
      if (!isTokenValid(decoded)) {
        localStorage.removeItem('accessToken');
        setUser(null);
        setToken(null);
        return;
      }
      localStorage.setItem('accessToken', newToken);
      setUser(decoded);
      setToken(newToken);
    } catch {
      console.error('Failed to decode token on login');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
