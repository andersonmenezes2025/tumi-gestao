import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from './use-toast';

type AIInsight = Tables<'ai_insights'>;

export function useAIInsights() {
  const { companyId } = useCompany();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['ai-insights', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIInsight[];
    },
    enabled: !!companyId,
  });

  const generateInsights = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error('No company ID');
      
      const { data, error } = await supabase.functions.invoke('ai-insights-generator', {
        body: { companyId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast({
        title: "Insights gerados",
        description: "Novos insights de IA foram gerados com sucesso!",
      });
    },
  });

  const updateInsightStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('ai_insights')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
    },
  });

  const dismissInsight = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ai_insights')
        .update({ status: 'dismissed' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast({
        title: "Insight dispensado",
        description: "Insight marcado como dispensado.",
      });
    },
  });

  const implementInsight = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('ai_insights')
        .update({ status: 'implemented' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast({
        title: "Insight implementado",
        description: "Insight marcado como implementado!",
      });
    },
  });

  const getInsightsByType = (type: string) => {
    return insights.filter(insight => insight.type === type);
  };

  const getInsightsByPriority = (priority: string) => {
    return insights.filter(insight => insight.priority === priority);
  };

  const getInsightsByStatus = (status: string) => {
    return insights.filter(insight => insight.status === status);
  };

  return {
    insights,
    isLoading,
    generateInsights: generateInsights.mutateAsync,
    updateInsightStatus: updateInsightStatus.mutateAsync,
    dismissInsight: dismissInsight.mutateAsync,
    implementInsight: implementInsight.mutateAsync,
    getInsightsByType,
    getInsightsByPriority,
    getInsightsByStatus,
    isGenerating: generateInsights.isPending,
    isUpdating: updateInsightStatus.isPending,
    isDismissing: dismissInsight.isPending,
    isImplementing: implementInsight.isPending,
  };
}