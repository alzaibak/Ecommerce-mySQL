import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { clearCorruptedStorage } from '@/utils/clearStorage';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // First, clear any corrupted storage data
      clearCorruptedStorage();
      
      const storedToken = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Validate that the user object has required fields
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            // Invalid user object structure
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        } catch (parseError) {
          // If JSON is invalid, clear the corrupted data
          console.error('Error parsing admin user from localStorage:', parseError);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
    } catch (error) {
      console.error('Error initializing auth context:', error);
      // On any error, clear potentially corrupted data
      try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

const login = async (email: string, password: string) => {
  // Call the login method directly
  const response = await authAPI.login(email, password);

  // Backend returns { user, token }
  const { user: userData, token } = response;

  if (!userData.isAdmin) {
    throw new Error('Access denied. Admin privileges required.');
  }

  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminUser', JSON.stringify(userData));

  setToken(token);
  setUser(userData);
};


  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!token && !!user?.isAdmin,
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
