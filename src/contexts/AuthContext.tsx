
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Company = Tables<'companies'>;

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  company: Company | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      setError(null);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Erro ao carregar perfil do usuário');
        setProfile(null);
        setCompany(null);
        return;
      }

      console.log('Profile data:', profileData);
      setProfile(profileData);
      
      if (profileData?.company_id) {
        console.log('Fetching company for ID:', profileData.company_id);
        
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .maybeSingle();
        
        if (companyError) {
          console.error('Error fetching company:', companyError);
          setError('Erro ao carregar dados da empresa');
          setCompany(null);
        } else {
          console.log('Company data:', companyData);
          setCompany(companyData);
          setError(null);
        }
      } else {
        console.log('No company_id in profile');
        // Criar empresa padrão se o usuário não tiver uma
        await createDefaultCompany(userId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setError('Erro ao carregar dados do usuário');
    }
  };

  const createDefaultCompany = async (userId: string) => {
    try {
      console.log('Creating default company for user:', userId);
      
      // Criar empresa padrão
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: 'Minha Empresa',
        }])
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        setError('Erro ao criar empresa padrão');
        return;
      }

      // Atualizar perfil com a nova empresa
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ company_id: newCompany.id })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile with company:', updateError);
        setError('Erro ao vincular empresa ao perfil');
        return;
      }

      // Buscar o perfil atualizado
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      setProfile(updatedProfile);
      setCompany(newCompany);
      setError(null);
      
      console.log('Default company created and linked successfully');
    } catch (error) {
      console.error('Error creating default company:', error);
      setError('Erro ao configurar empresa padrão');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Buscar perfil quando usuário fizer login
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 100);
      } else {
        setProfile(null);
        setCompany(null);
        setError(null);
      }
      
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setError('Erro ao verificar sessão');
        setLoading(false);
        return;
      }
      
      console.log('Initial session:', session?.user?.id);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('AuthProvider cleanup');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('Signing out...');
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setCompany(null);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      company,
      loading,
      signOut,
      refreshProfile,
      error
    }}>
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
