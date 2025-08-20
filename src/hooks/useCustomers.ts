
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { Customer } from '@/types/database';



export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchCustomers = async () => {
    if (!companyId) return;
    
    try {
      const response = await apiClient.get(`/data/customers?company_id=${companyId}&order=name:asc`);
      setCustomers(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiClient.post('/data/customers', customer);
      
      setCustomers(prev => [...prev, response.data]);
      toast({
        title: "Cliente criado com sucesso!",
        description: `${customer.name} foi adicionado à base de clientes.`,
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Cliente atualizado com sucesso!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Cliente removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCustomers().finally(() => {
        setLoading(false);
      });
    }
  }, [companyId]);

  return {
    customers,
    loading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers: fetchCustomers
  };
}
