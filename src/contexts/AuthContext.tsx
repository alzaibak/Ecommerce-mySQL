import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginStart, loginSuccess, loginFailure, logout as logoutRedux } from '@/redux/userSlice';

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isLocalStorageAvailable = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.user.currentUser);
  const [user, setUser] = useState<User | null>(reduxUser?.userInfo || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLocalStorageAvailable()) return setIsLoading(false);

    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);

        // Only admins allowed
        if (!parsedUser.isAdmin) {
          setUser(null);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          dispatch(logoutRedux());
        } else {
          setUser(parsedUser);
        }
      } catch {
        localStorage.clear();
      }
    }

    setIsLoading(false);
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    dispatch(loginStart());
    try {
      const response = await api.post('/auth/admin/login', { email, password });

      if (response.token && response.user?.isAdmin) {
        setUser(response.user);

        if (isLocalStorageAvailable()) {
          localStorage.setItem('adminToken', response.token);
          localStorage.setItem('adminUser', JSON.stringify(response.user));
        }

        dispatch(loginSuccess({ userInfo: response.user, token: response.token }));
      } else {
        throw new Error('Access denied');
      }
    } catch (error) {
      dispatch(loginFailure());
      throw error instanceof Error ? error : new Error('You are not admin');
    }
  };

  const logout = () => {
    setUser(null);
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    dispatch(logoutRedux());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
