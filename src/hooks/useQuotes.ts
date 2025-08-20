import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useCompany } from './useCompany';
import { useToast } from './use-toast';
import { Quote } from '@/types/database';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchQuotes = async () => {
    if (!companyId) return;
    
    try {
      const response = await apiClient.get(`/data/quotes?company_id=${companyId}&order=created_at:desc`);
      setQuotes(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar orçamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>, items?: any[]) => {
    try {
      const response = await apiClient.post('/data/quotes', quote);
      
      // Save quote items if provided
      if (items && items.length > 0) {
        for (const item of items) {
          await apiClient.post('/data/quote_items', {
            quote_id: response.data.id,
            ...item,
          });
        }
      }

      setQuotes(prev => [response.data, ...prev]);
      toast({
        title: "Orçamento criado com sucesso!",
        description: `Orçamento para ${quote.customer_name} foi criado.`,
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar orçamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>, items?: any[]) => {
    try {
      const response = await apiClient.put(`/data/quotes/${id}`, updates);
      
      // Update quote items if provided
      if (items) {
        // Delete existing items
        await apiClient.delete(`/data/quote_items?quote_id=${id}`);
        
        // Add new items
        for (const item of items) {
          await apiClient.post('/data/quote_items', {
            quote_id: id,
            ...item,
          });
        }
      }

      setQuotes(prev => prev.map(q => q.id === id ? response.data : q));
      toast({
        title: "Orçamento atualizado com sucesso!",
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar orçamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await apiClient.delete(`/data/quotes/${id}`);
      
      setQuotes(prev => prev.filter(q => q.id !== id));
      toast({
        title: "Orçamento removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover orçamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateShareLink = async (quoteId: string) => {
    try {
      // Generate a public token for the quote
      const publicToken = `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await apiClient.put(`/data/quotes/${quoteId}`, {
        public_token: publicToken,
      });

      const shareLink = `${window.location.origin}/quote/${publicToken}`;
      
      // Update local state
      setQuotes(prev => prev.map(q => 
        q.id === quoteId ? { ...q, public_token: publicToken } : q
      ));

      return shareLink;
    } catch (error: any) {
      toast({
        title: "Erro ao gerar link",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchQuotes();
    }
  }, [companyId]);

  return {
    quotes,
    loading,
    createQuote,
    updateQuote,
    deleteQuote,
    generateShareLink,
    refreshQuotes: fetchQuotes
  };
}