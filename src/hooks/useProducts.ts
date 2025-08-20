
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';
import { Product, ProductCategory } from '@/types/database';


export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (!companyId) return;
    
    try {
      const response = await apiClient.get(`/data/products?company_id=${companyId}&order=name:asc`);
      setProducts(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    if (!companyId) return;
    
    try {
      const response = await apiClient.get(`/data/product_categories?company_id=${companyId}&order=name:asc`);
      setCategories(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await apiClient.post('/data/products', product);
      
      setProducts(prev => [...prev, response.data]);
      toast({
        title: "Produto criado com sucesso!",
        description: `${product.name} foi adicionado ao catálogo.`,
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const response = await apiClient.put(`/data/products/${id}`, updates);
      
      setProducts(prev => prev.map(p => p.id === id ? response.data : p));
      toast({
        title: "Produto atualizado com sucesso!",
      });
      
      return response.data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiClient.delete(`/data/products/${id}`);
      
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Produto removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover produto",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (companyId) {
      Promise.all([fetchProducts(), fetchCategories()]).finally(() => {
        setLoading(false);
      });
    }
  }, [companyId]);

  return {
    products,
    categories,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts,
    refreshCategories: fetchCategories
  };
}
