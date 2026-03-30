import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { phone, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name: string, phone: string, password: string, role: string = 'patient') => {
    try {
      const response = await api.post('/auth/register', { name, phone, password, role });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
