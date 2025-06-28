
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
    if (!companyId) {
      console.log('No companyId available, skipping dashboard stats fetch');
      setLoading(false);
      return;
    }
    
    console.log('Fetching dashboard stats for company:', companyId);
    
    try {
      // Fetch products stats with error handling
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock_quantity, min_stock')
        .eq('company_id', companyId);

      if (productsError) {
        console.error('Products error:', productsError);
        throw productsError;
      }

      // Fetch customers stats with error handling
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('active')
        .eq('company_id', companyId);

      if (customersError) {
        console.error('Customers error:', customersError);
        throw customersError;
      }

      // Fetch sales stats with error handling
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount, created_at')
        .eq('company_id', companyId);

      if (salesError) {
        console.error('Sales error:', salesError);
        throw salesError;
      }

      console.log('Dashboard data fetched:', { 
        products: products?.length, 
        customers: customers?.length, 
        sales: sales?.length 
      });

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
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log('Dashboard hook effect - companyId:', companyId);
    
    if (companyId) {
      fetchDashboardStats().finally(() => {
        setLoading(false);
      });
    } else {
      // Still loading if no companyId yet
      const timer = setTimeout(() => {
        if (!companyId) {
          console.log('Dashboard timeout - no company found');
          setLoading(false);
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [companyId]);

  return {
    stats,
    loading,
    refreshStats: fetchDashboardStats
  };
}
