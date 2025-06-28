
import { useAuth } from '@/contexts/AuthContext';

export function useCompany() {
  const { company, profile, error, loading } = useAuth();
  
  return {
    company,
    companyId: company?.id,
    isAdmin: profile?.role === 'admin',
    hasCompany: !!company,
    error,
    loading: loading && !error
  };
}
