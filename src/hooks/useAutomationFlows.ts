import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from './use-toast';

type AutomationFlow = Tables<'automation_flows'>;

export function useAutomationFlows() {
  const { companyId } = useCompany();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: flows = [], isLoading } = useQuery({
    queryKey: ['automation-flows', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('automation_flows')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AutomationFlow[];
    },
    enabled: !!companyId,
  });

  const createFlow = useMutation({
    mutationFn: async (flow: Omit<AutomationFlow, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      if (!companyId) throw new Error('No company ID');
      
      const { data, error } = await supabase
        .from('automation_flows')
        .insert([{ ...flow, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('automation_flows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('automation_flows')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('automation_flows')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase.functions.invoke('automation-executor', {
        body: { flowId, companyId },
      });

      if (error) throw error;
      return data;
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