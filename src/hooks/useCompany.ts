
import { useAuth } from '@/contexts/AuthContext';

export function useCompany() {
  const { company, profile, error, loading } = useAuth();
  
  console.log('useCompany - Company:', company);
  console.log('useCompany - Profile:', profile);
  console.log('useCompany - Has company:', !!company);
  
  // Verificar se tem empresa pelo company_id do profile ou pela empresa direta
  const hasCompany = !!(company?.id || profile?.company_id);
  
  return {
    company,
    companyId: company?.id || profile?.company_id,
    isAdmin: profile?.role === 'admin',
    hasCompany,
    error,
    loading: loading && !error
  };
}
