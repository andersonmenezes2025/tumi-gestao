
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';

interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  lowStockProducts: number;
  activeCustomers: number;
  totalSales: number;
  monthlyRevenue: number;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    activeCustomers: 0,
    totalSales: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const { companyId, hasCompany } = useCompany();

  const fetchDashboardStats = async () => {
    if (!companyId || !hasCompany) {
      console.log('No companyId available or no company, setting default stats');
      setStats({
        totalProducts: 0,
        totalCustomers: 0,
        lowStockProducts: 0,
        activeCustomers: 0,
        totalSales: 0,
        monthlyRevenue: 0
      });
      setLoading(false);
      return;
    }
    
    console.log('Fetching dashboard stats for company:', companyId);
    setLoading(true);
    
    try {
      // Buscar estatísticas em paralelo
      const [productsResult, customersResult, salesResult] = await Promise.allSettled([
        supabase
          .from('products')
          .select('stock_quantity, min_stock')
          .eq('company_id', companyId),
        supabase
          .from('customers')
          .select('active')
          .eq('company_id', companyId),
        supabase
          .from('sales')
          .select('total_amount, created_at')
          .eq('company_id', companyId)
      ]);

      // Processar resultados de produtos
      let totalProducts = 0;
      let lowStockProducts = 0;
      if (productsResult.status === 'fulfilled' && productsResult.value.data) {
        const products = productsResult.value.data;
        totalProducts = products.length;
        lowStockProducts = products.filter(p => 
          (p.stock_quantity || 0) <= (p.min_stock || 0)
        ).length;
      }

      // Processar resultados de clientes
      let totalCustomers = 0;
      let activeCustomers = 0;
      if (customersResult.status === 'fulfilled' && customersResult.value.data) {
        const customers = customersResult.value.data;
        totalCustomers = customers.length;
        activeCustomers = customers.filter(c => c.active).length;
      }

      // Processar resultados de vendas
      let totalSales = 0;
      let monthlyRevenue = 0;
      if (salesResult.status === 'fulfilled' && salesResult.value.data) {
        const sales = salesResult.value.data;
        totalSales = sales.length;

        // Calcular receita mensal (mês atual)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        monthlyRevenue = sales.reduce((sum, sale) => {
          const saleDate = new Date(sale.created_at || '');
          if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
            return sum + (sale.total_amount || 0);
          }
          return sum;
        }, 0);
      }

      console.log('Dashboard stats calculated:', {
        totalProducts,
        totalCustomers,
        lowStockProducts,
        activeCustomers,
        totalSales,
        monthlyRevenue
      });

      setStats({
        totalProducts,
        totalCustomers,
        lowStockProducts,
        activeCustomers,
        totalSales,
        monthlyRevenue
      });

    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      // Em caso de erro, manter valores zerados
      setStats({
        totalProducts: 0,
        totalCustomers: 0,
        lowStockProducts: 0,
        activeCustomers: 0,
        totalSales: 0,
        monthlyRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Dashboard hook effect - companyId:', companyId, 'hasCompany:', hasCompany);
    fetchDashboardStats();
  }, [companyId, hasCompany]);

  return {
    stats,
    loading,
    refreshStats: fetchDashboardStats
  };
}
