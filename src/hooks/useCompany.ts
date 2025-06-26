
import { useAuth } from '@/contexts/AuthContext';

export function useCompany() {
  const { company, profile } = useAuth();
  
  return {
    company,
    companyId: company?.id,
    isAdmin: profile?.role === 'admin',
    hasCompany: !!company
  };
}
