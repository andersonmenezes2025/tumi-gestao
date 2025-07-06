import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';
import { Tables } from '@/integrations/supabase/types';

type Integration = Tables<'integrations'>;

export function useIntegrations() {
  const { companyId } = useCompany();
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Integration[];
    },
    enabled: !!companyId,
  });

  const createIntegration = useMutation({
    mutationFn: async (integration: Omit<Integration, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('integrations')
        .insert([integration])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const updateIntegration = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Integration> & { id: string }) => {
      const { data, error } = await supabase
        .from('integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const getIntegrationByType = (type: string) => {
    return integrations.find(integration => integration.type === type);
  };

  const isIntegrationActive = (type: string) => {
    const integration = getIntegrationByType(type);
    return integration?.active || false;
  };

  return {
    integrations,
    isLoading,
    createIntegration: createIntegration.mutateAsync,
    updateIntegration: updateIntegration.mutateAsync,
    deleteIntegration: deleteIntegration.mutateAsync,
    getIntegrationByType,
    isIntegrationActive,
    isCreating: createIntegration.isPending,
    isUpdating: updateIntegration.isPending,
    isDeleting: deleteIntegration.isPending,
  };
}