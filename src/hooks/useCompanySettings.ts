
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { Tables } from '@/integrations/supabase/types';

type CompanyUpdate = Partial<Omit<Tables<'companies'>, 'id' | 'created_at' | 'updated_at'>>;

export function useCompanySettings() {
  const { companyId } = useCompany();
  const queryClient = useQueryClient();

  const updateCompany = useMutation({
    mutationFn: async (data: CompanyUpdate) => {
      if (!companyId) {
        throw new Error('Company ID not found');
      }

      console.log('Updating company:', companyId, data);

      const { data: result, error } = await supabase
        .from('companies')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        throw error;
      }

      console.log('Company updated successfully:', result);
      return result;
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
