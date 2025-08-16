import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';
import { useToast } from './use-toast';
import { Tables } from '@/integrations/supabase/types';

type AccountsReceivable = Tables<'accounts_receivable'>;
type AccountsPayable = Tables<'accounts_payable'>;

interface FinancialSummary {
  totalReceivables: number;
  totalPayables: number;
  totalReceived: number;
  totalPaid: number;
  balance: number;
  pendingReceivables: number;
  pendingPayables: number;
}

export function useFinancial() {
  const [receivables, setReceivables] = useState<AccountsReceivable[]>([]);
  const [payables, setPayables] = useState<AccountsPayable[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalReceivables: 0,
    totalPayables: 0,
    totalReceived: 0,
    totalPaid: 0,
    balance: 0,
    pendingReceivables: 0,
    pendingPayables: 0,
  });
  
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchFinancialData = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      // Fetch accounts receivable
      const { data: receivablesData, error: receivablesError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .eq('company_id', companyId)
        .order('due_date', { ascending: false });

      if (receivablesError) throw receivablesError;
      
      // Fetch accounts payable
      const { data: payablesData, error: payablesError } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', companyId)
        .order('due_date', { ascending: false });

      if (payablesError) throw payablesError;

      setReceivables(receivablesData || []);
      setPayables(payablesData || []);

      // Calculate summary
      const totalReceivables = receivablesData?.reduce((sum, r) => sum + r.amount, 0) || 0;
      const totalPayables = payablesData?.reduce((sum, p) => sum + p.amount, 0) || 0;
      
      const totalReceived = receivablesData?.reduce((sum, r) => {
        return sum + (r.status === 'paid' ? (r.payment_amount || r.amount) : 0);
      }, 0) || 0;
      
      const totalPaid = payablesData?.reduce((sum, p) => {
        return sum + (p.status === 'paid' ? (p.payment_amount || p.amount) : 0);
      }, 0) || 0;

      const pendingReceivables = receivablesData?.reduce((sum, r) => {
        return sum + (r.status === 'pending' ? r.amount : 0);
      }, 0) || 0;
      
      const pendingPayables = payablesData?.reduce((sum, p) => {
        return sum + (p.status === 'pending' ? p.amount : 0);
      }, 0) || 0;

      setSummary({
        totalReceivables,
        totalPayables,
        totalReceived,
        totalPaid,
        balance: totalReceived - totalPaid,
        pendingReceivables,
        pendingPayables,
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar dados financeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReceivable = async (receivable: Omit<AccountsReceivable, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!companyId) return null;

    try {
      const { data, error } = await supabase
        .from('accounts_receivable')
        .insert([{ ...receivable, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta a receber criada com sucesso",
      });

      await fetchFinancialData();
      return data;
    } catch (error) {
      console.error('Error creating receivable:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta a receber",
        variant: "destructive",
      });
      return null;
    }
  };

  const createPayable = async (payable: Omit<AccountsPayable, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!companyId) return null;

    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .insert([{ ...payable, company_id: companyId }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta a pagar criada com sucesso",
      });

      await fetchFinancialData();
      return data;
    } catch (error) {
      console.error('Error creating payable:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta a pagar",
        variant: "destructive",
      });
      return null;
    }
  };

  const markReceivableAsPaid = async (id: string, paymentAmount?: number, paymentDate?: string) => {
    try {
      const { error } = await supabase
        .from('accounts_receivable')
        .update({
          status: 'paid',
          payment_amount: paymentAmount,
          payment_date: paymentDate || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta marcada como paga",
      });

      await fetchFinancialData();
    } catch (error) {
      console.error('Error marking receivable as paid:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar conta como paga",
        variant: "destructive",
      });
    }
  };

  const markPayableAsPaid = async (id: string, paymentAmount?: number, paymentDate?: string) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .update({
          status: 'paid',
          payment_amount: paymentAmount,
          payment_date: paymentDate || new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta marcada como paga",
      });

      await fetchFinancialData();
    } catch (error) {
      console.error('Error marking payable as paid:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar conta como paga",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchFinancialData();
    }
  }, [companyId]);

  return {
    receivables,
    payables,
    loading,
    summary,
    createReceivable,
    createPayable,
    markReceivableAsPaid,
    markPayableAsPaid,
    refreshData: fetchFinancialData,
  };
}