import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useCompany } from './useCompany';
import { useToast } from './use-toast';
import { AccountsReceivable, AccountsPayable } from '@/types/database';

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
  const [loading, setLoading] = useState(true);
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

  const calculateSummary = (receivablesData: AccountsReceivable[], payablesData: AccountsPayable[]) => {
    const totalReceivables = receivablesData.reduce((sum, item) => sum + item.amount, 0);
    const totalPayables = payablesData.reduce((sum, item) => sum + item.amount, 0);
    
    const totalReceived = receivablesData
      .filter(item => item.status === 'paid')
      .reduce((sum, item) => sum + (item.payment_amount || item.amount), 0);
    
    const totalPaid = payablesData
      .filter(item => item.status === 'paid')
      .reduce((sum, item) => sum + (item.payment_amount || item.amount), 0);
    
    const pendingReceivables = receivablesData
      .filter(item => item.status === 'pending')
      .reduce((sum, item) => sum + item.amount, 0);
    
    const pendingPayables = payablesData
      .filter(item => item.status === 'pending')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      totalReceivables,
      totalPayables,
      totalReceived,
      totalPaid,
      balance: totalReceived - totalPaid,
      pendingReceivables,
      pendingPayables,
    };
  };

  const fetchFinancialData = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const [receivablesRes, payablesRes] = await Promise.all([
        apiClient.get(`/data/accounts_receivable?company_id=${companyId}&order=due_date:desc`),
        apiClient.get(`/data/accounts_payable?company_id=${companyId}&order=due_date:desc`)
      ]);

      const receivablesData = receivablesRes.data || [];
      const payablesData = payablesRes.data || [];

      setReceivables(receivablesData);
      setPayables(payablesData);
      setSummary(calculateSummary(receivablesData, payablesData));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReceivable = async (receivable: Omit<AccountsReceivable, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!companyId) return;

    try {
      const response = await apiClient.post('/data/accounts_receivable', {
        ...receivable,
        company_id: companyId,
        status: 'pending',
      });

      toast({
        title: "Conta a receber criada",
        description: "Nova conta a receber foi adicionada com sucesso!",
      });

      await fetchFinancialData();
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar conta a receber",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createPayable = async (payable: Omit<AccountsPayable, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
    if (!companyId) return;

    try {
      const response = await apiClient.post('/data/accounts_payable', {
        ...payable,
        company_id: companyId,
        status: 'pending',
      });

      toast({
        title: "Conta a pagar criada",
        description: "Nova conta a pagar foi adicionada com sucesso!",
      });

      await fetchFinancialData();
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar conta a pagar",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markReceivableAsPaid = async (id: string, paymentAmount?: number, paymentDate?: string) => {
    try {
      await apiClient.put(`/data/accounts_receivable/${id}`, {
        status: 'paid',
        payment_amount: paymentAmount,
        payment_date: paymentDate || new Date().toISOString(),
      });

      toast({
        title: "Pagamento registrado",
        description: "Conta a receber marcada como paga!",
      });

      await fetchFinancialData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao marcar como paga",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markPayableAsPaid = async (id: string, paymentAmount?: number, paymentDate?: string) => {
    try {
      await apiClient.put(`/data/accounts_payable/${id}`, {
        status: 'paid',
        payment_amount: paymentAmount,
        payment_date: paymentDate || new Date().toISOString(),
      });

      toast({
        title: "Pagamento registrado",
        description: "Conta a pagar marcada como paga!",
      });

      await fetchFinancialData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao marcar como paga",
        variant: "destructive",
      });
      throw error;
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
    refreshFinancialData: fetchFinancialData,
  };
}