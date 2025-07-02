
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
        console.error('Profile fetch error:', profileError);
        setError('Erro ao carregar perfil do usuário');
        setProfile(null);
        setCompany(null);
        return;
      }

      console.log('Profile fetched:', profileData);
      setProfile(profileData);
      
      if (profileData?.company_id) {
        console.log('Fetching company with ID:', profileData.company_id);
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .maybeSingle();
        
        if (companyError) {
          console.error('Company fetch error:', companyError);
          setCompany(null);
        } else {
          console.log('Company fetched:', companyData);
          setCompany(companyData);
        }
        setError(null);
      } else {
        console.log('No company_id in profile');
        setCompany(null);
        setError(null);
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
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
