
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Company } from '@/types/database';
import { apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      setError(null);
      
      const response = await apiClient.get(`/data/profiles?eq=id.${userId}`);
      const profileData = response.data?.[0];

      console.log('Profile fetched:', profileData);
      setProfile(profileData);
      
      if (profileData?.company_id) {
        console.log('Fetching company with ID:', profileData.company_id);
        const companyResponse = await apiClient.get(`/data/companies?eq=id.${profileData.company_id}`);
        const companyData = companyResponse.data?.[0];
        
        console.log('Company fetched:', companyData);
        setCompany(companyData);
      } else {
        console.log('No company_id in profile');
        setCompany(null);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      setError('Erro ao carregar dados do usuário');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/logout');
      setUser(null);
      setProfile(null);
      setCompany(null);
      localStorage.removeItem('token');
    } catch (error) {
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/profile');
        const userData = response.data;
        
        setUser({ 
          id: userData.id, 
          email: userData.email 
        });
        
        await fetchProfile(userData.id);
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        setError('Sessão expirada');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    company,
    loading,
    signOut,
    refreshProfile,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
