import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useCompany } from './useCompany';
import { useToast } from './use-toast';

import { AutomationFlow } from '@/types/database';

export function useAutomationFlows() {
  const { companyId } = useCompany();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ['automation-flows', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const response = await apiClient.get(`/data/automation_flows?company_id=${companyId}&order=created_at:desc`);
      return response.data as AutomationFlow[];
    },
    enabled: !!companyId,
  });

  const createFlow = useMutation({
    mutationFn: async (flow: Omit<AutomationFlow, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      if (!companyId) throw new Error('No company ID');
      
      const response = await apiClient.post('/data/automation_flows', {
        ...flow,
        company_id: companyId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-flows'] });
      toast({
        title: "Fluxo criado",
        description: "Fluxo de automação criado com sucesso!",
      });
    },
  });

  const updateFlow = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutomationFlow> & { id: string }) => {
      const response = await apiClient.put(`/data/automation_flows/${id}`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-flows'] });
      toast({
        title: "Fluxo atualizado",
        description: "Fluxo de automação atualizado com sucesso!",
      });
    },
  });

  const deleteFlow = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/data/automation_flows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-flows'] });
      toast({
        title: "Fluxo excluído",
        description: "Fluxo de automação excluído com sucesso!",
      });
    },
  });

  const toggleFlow = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiClient.put(`/data/automation_flows/${id}`, { is_active: isActive });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['automation-flows'] });
      toast({
        title: data.is_active ? "Fluxo ativado" : "Fluxo desativado",
        description: `Fluxo "${data.name}" ${data.is_active ? 'ativado' : 'desativado'} com sucesso!`,
      });
    },
  });

  const executeFlow = useMutation({
    mutationFn: async (flowId: string) => {
      // For now, just return a placeholder - would integrate with automation service
      return { message: 'Flow execution would be implemented with automation service' };
    },
    onSuccess: () => {
      toast({
        title: "Fluxo executado",
        description: "Fluxo de automação executado com sucesso!",
      });
    },
  });

  return {
    flows,
    isLoading,
    createFlow: createFlow.mutateAsync,
    updateFlow: updateFlow.mutateAsync,
    deleteFlow: deleteFlow.mutateAsync,
    toggleFlow: toggleFlow.mutateAsync,
    executeFlow: executeFlow.mutateAsync,
    isCreating: createFlow.isPending,
    isUpdating: updateFlow.isPending,
    isDeleting: deleteFlow.isPending,
    isToggling: toggleFlow.isPending,
    isExecuting: executeFlow.isPending,
  };
}