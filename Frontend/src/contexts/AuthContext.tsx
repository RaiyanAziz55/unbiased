import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';

interface User {
  userId: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const session = authApi.getSession();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    authApi.saveSession(response.user_id, response.username || username);
    setUser({ userId: response.user_id, username: response.username || username });
  };

  const signup = async (username: string, password: string) => {
    const response = await authApi.signup(username, password);
    // After signup, automatically log them in
    authApi.saveSession(response.user_id, username);
    setUser({ userId: response.user_id, username });
  };

  const logout = () => {
    authApi.clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
