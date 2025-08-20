
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useCompany } from '@/hooks/useCompany';
import { Company } from '@/types/database';

type CompanyUpdate = Partial<Omit<Company, 'id' | 'created_at' | 'updated_at'>>;

export function useCompanySettings() {
  const { companyId } = useCompany();
  const queryClient = useQueryClient();

  const updateCompany = useMutation({
    mutationFn: async (data: CompanyUpdate) => {
      if (!companyId) {
        throw new Error('Company ID not found');
      }

      console.log('Updating company:', companyId, data);

      const response = await apiClient.put(`/data/companies/${companyId}`, {
        ...data,
        updated_at: new Date().toISOString(),
      });

      console.log('Company updated successfully:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch company data
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    updateCompany: updateCompany.mutateAsync,
    isUpdating: updateCompany.isPending,
  };
}
