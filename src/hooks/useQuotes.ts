import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;
type QuoteItem = Tables<'quote_items'>;

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchQuotes = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar orçamentos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createQuote = async (quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>, items?: any[]) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .insert([quote])
        .select()
        .single();

      if (error) throw error;
      
      // Save quote items if provided
      if (items && items.length > 0) {
        const quoteItems = items.map(item => ({
          quote_id: data.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(quoteItems);

        if (itemsError) throw itemsError;
      }
      
      setQuotes(prev => [data, ...prev]);
      toast({
        title: "Orçamento criado com sucesso!",
        description: `Orçamento para ${quote.customer_name} foi criado.`,
      });
      
      return data;
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
      const { data, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update quote items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', id);

        // Insert new items
        if (items.length > 0) {
          const quoteItems = items.map(item => ({
            quote_id: id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
          }));

          const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(quoteItems);

          if (itemsError) throw itemsError;
        }
      }
      
      setQuotes(prev => prev.map(q => q.id === id ? data : q));
      toast({
        title: "Orçamento atualizado com sucesso!",
      });
      
      return data;
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
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_quote_token');
      
      if (tokenError) throw tokenError;

      // Update the quote with the public token
      const { data, error } = await supabase
        .from('quotes')
        .update({ public_token: tokenData })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setQuotes(prev => prev.map(q => q.id === quoteId ? data : q));

      // Return the public URL
      const baseUrl = window.location.origin;
      return `${baseUrl}/quote/${tokenData}`;
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
      fetchQuotes().finally(() => {
        setLoading(false);
      });
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