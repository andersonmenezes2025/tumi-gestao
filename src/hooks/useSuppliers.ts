import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { Supplier } from '@/types/database';



export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    if (!companyId) return;
    
    try {
      const response = await apiClient.get(`/data/suppliers?company_id=${companyId}&order=name:asc`);
      setSuppliers(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar fornecedores",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiClient.post('/data/suppliers', supplier);
      
      setSuppliers(prev => [...prev, response.data]);
      toast({
        title: "Fornecedor criado com sucesso!",
        description: `${supplier.name} foi adicionado.`,
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar fornecedor",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const response = await apiClient.put(`/data/suppliers/${id}`, updates);
      
      setSuppliers(prev => prev.map(s => s.id === id ? response.data : s));
      toast({
        title: "Fornecedor atualizado com sucesso!",
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar fornecedor",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await apiClient.delete(`/data/suppliers/${id}`);
      
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Fornecedor removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover fornecedor",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchSuppliers().finally(() => {
        setLoading(false);
      });
    }
  }, [companyId]);

  return {
    suppliers,
    loading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refreshSuppliers: fetchSuppliers
  };
}