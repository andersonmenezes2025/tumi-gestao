import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useCompany } from './useCompany';

interface Integration {
  id: string;
  company_id: string;
  type: string;
  name: string;
  config: any;
  active: boolean;
  created_at: string;
  updated_at: string;
}



export function useIntegrations() {
  const { companyId } = useCompany();
  const queryClient = useQueryClient();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const response = await apiClient.get(`/data/integrations?company_id=${companyId}&order=created_at:desc`);
      return response.data as Integration[];
    },
    enabled: !!companyId,
  });

  const createIntegration = useMutation({
    mutationFn: async (integration: Omit<Integration, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await apiClient.post('/data/integrations', integration);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const updateIntegration = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Integration> & { id: string }) => {
      const response = await apiClient.put(`/data/integrations/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const deleteIntegration = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/data/integrations/${id}`);
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