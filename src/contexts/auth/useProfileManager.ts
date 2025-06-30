
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
        console.log('No company_id in profile - user needs to create or join a company');
        setCompany(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
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
