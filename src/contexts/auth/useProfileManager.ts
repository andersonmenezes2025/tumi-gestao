
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Company } from './types';

export function useProfileManager() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      setError(null);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        setError('Erro ao carregar perfil do usuário');
        setProfile(null);
        setCompany(null);
        return;
      }

      setProfile(profileData);
      
      if (profileData?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .maybeSingle();
        
        if (companyError) {
          setCompany(null);
        } else {
          setCompany(companyData);
        }
        setError(null);
      } else {
        setCompany(null);
        setError(null);
      }
    } catch (error) {
      setError('Erro ao carregar dados do usuário');
    }
  };

  const refreshProfile = async (user: User | null) => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setCompany(null);
    setError(null);
  };

  return {
    profile,
    company,
    error,
    fetchProfile,
    refreshProfile,
    clearProfile,
    setError
  };
}
