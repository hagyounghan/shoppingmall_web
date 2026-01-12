import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 인증 정보 복원
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser({ ...userData, token });
      } catch (error) {
        // 잘못된 데이터면 삭제
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO: 실제 API 호출로 교체
      // 임시 로그인 로직
      if (email && password) {
        const mockUser: AuthUser = {
          id: '1',
          email,
          name: email.split('@')[0],
          token: `mock_token_${Date.now()}`,
        };
        
        localStorage.setItem(AUTH_TOKEN_KEY, mockUser.token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        }));
        
        setUser(mockUser);
      } else {
        throw new Error('이메일과 비밀번호를 입력해주세요.');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('로그인에 실패했습니다.');
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
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

