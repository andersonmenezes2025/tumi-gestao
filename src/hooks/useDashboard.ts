
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
  const { companyId, hasCompany } = useCompany();
  const { toast } = useToast();

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
    
    try {
      // Fetch products stats
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock_quantity, min_stock')
        .eq('company_id', companyId);

      if (productsError) {
        console.error('Products error:', productsError);
      }

      // Fetch customers stats
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('active')
        .eq('company_id', companyId);

      if (customersError) {
        console.error('Customers error:', customersError);
      }

      // Fetch sales stats
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total_amount, created_at')
        .eq('company_id', companyId);

      if (salesError) {
        console.error('Sales error:', salesError);
      }

      console.log('Dashboard data fetched:', { 
        products: products?.length || 0, 
        customers: customers?.length || 0, 
        sales: sales?.length || 0
      });

      // Calculate stats with fallbacks
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
      // Don't show toast error for dashboard stats, just log it
      setStats({
        totalProducts: 0,
        totalCustomers: 0,
        lowStockProducts: 0,
        activeCustomers: 0,
        totalSales: 0,
        monthlyRevenue: 0
      });
    }
  };

  useEffect(() => {
    console.log('Dashboard hook effect - companyId:', companyId, 'hasCompany:', hasCompany);
    
    if (hasCompany && companyId) {
      fetchDashboardStats().finally(() => {
        setLoading(false);
      });
    } else {
      // Se não tem empresa, define loading como false após um tempo
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [companyId, hasCompany]);

  return {
    stats,
    loading,
    refreshStats: fetchDashboardStats
  };
}
