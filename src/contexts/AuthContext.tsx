import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthResponse } from '../types';
import { apiPost, apiGet, ApiClientError } from '../lib/api-client';
import { API_ENDPOINTS } from '../config/api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    fishingPoints: user.fishingPoints,
  }));
}

function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);

    if (!token || !userStr) {
      setLoading(false);
      return;
    }

    // 토큰 유효성 서버에서 확인
    apiGet<AuthUser>(API_ENDPOINTS.ME)
      .then((me) => {
        setUser({ ...me, token });
      })
      .catch((err) => {
        if (err instanceof ApiClientError && err.status === 401) {
          clearAuth();
        } else {
          // 네트워크 오류 등: 로컬 정보로 복원
          try {
            const userData = JSON.parse(userStr);
            setUser({ ...userData, token });
          } catch {
            clearAuth();
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiPost<AuthResponse>(API_ENDPOINTS.LOGIN, { email, password });
    const authUser: AuthUser = {
      id: res.user.id,
      email: res.user.email,
      name: res.user.name,
      phone: res.user.phone,
      fishingPoints: res.user.fishingPoints,
      token: res.token,
    };
    saveAuth(res.token, authUser);
    setUser(authUser);
  };

  const register = async (email: string, password: string, name: string, phone?: string) => {
    const res = await apiPost<AuthResponse>(API_ENDPOINTS.REGISTER, { email, password, name, phone });
    const authUser: AuthUser = {
      id: res.user.id,
      email: res.user.email,
      name: res.user.name,
      phone: res.user.phone,
      fishingPoints: res.user.fishingPoints,
      token: res.token,
    };
    saveAuth(res.token, authUser);
    setUser(authUser);
  };

  const logout = async () => {
    try {
      await apiPost(API_ENDPOINTS.LOGOUT);
    } catch {
      // 실패해도 로컬 정리
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
