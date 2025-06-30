
import { useAuth } from '@/contexts/AuthContext';

export function useCompany() {
  const { company, profile, error, loading } = useAuth();
  
  console.log('useCompany - Company:', company);
  console.log('useCompany - Profile:', profile);
  console.log('useCompany - Has company:', !!company);
  
  return {
    company,
    companyId: company?.id,
    isAdmin: profile?.role === 'admin',
    hasCompany: !!company && !!company.id,
    error,
    loading: loading && !error
  };
}
