
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/use-toast';

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
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchDashboardStats = async () => {
    if (!companyId) return;
    
    try {
      // Fetch products stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock_quantity, min_stock')
        .eq('company_id', companyId);

      if (productsError) throw productsError;

      // Fetch customers stats
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('active')
        .eq('company_id', companyId);

      if (customersError) throw customersError;

      // Fetch sales stats
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount, created_at')
        .eq('company_id', companyId);

      if (salesError) throw salesError;

      // Calculate stats
      const totalProducts = products?.length || 0;
      const totalCustomers = customers?.length || 0;
      const lowStockProducts = products?.filter(p => 
        (p.stock_quantity || 0) <= (p.min_stock || 0)
      ).length || 0;
      const activeCustomers = customers?.filter(c => c.active).length || 0;
      const totalSales = sales?.length || 0;

      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = sales?.reduce((sum, sale) => {
        const saleDate = new Date(sale.created_at || '');
        if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
          return sum + (sale.total_amount || 0);
        }
        return sum;
      }, 0) || 0;

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
      toast({
        title: "Erro ao carregar estatísticas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchDashboardStats().finally(() => {
        setLoading(false);
      });
    }
  }, [companyId]);

  return {
    stats,
    loading,
    refreshStats: fetchDashboardStats
  };
}
