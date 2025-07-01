
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfileManager } from './useProfileManager';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    profile,
    company,
    error,
    fetchProfile,
    refreshProfile,
    clearProfile,
    setError
  } = useProfileManager();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch profile when user logs in
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 100);
      } else {
        clearProfile();
      }
      
      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError('Erro ao verificar sessão');
        setLoading(false);
        return;
      }
      
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
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      clearProfile();
    } catch (error) {
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshProfile = async () => {
    await refreshProfile(user);
  };

  return {
    user,
    profile,
    company,
    loading,
    error,
    signOut,
    refreshProfile: handleRefreshProfile
  };
}
