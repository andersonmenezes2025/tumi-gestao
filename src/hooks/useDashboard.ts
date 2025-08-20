import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
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
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const { companyId, hasCompany } = useCompany();

  const fetchDashboardStats = async () => {
    if (!companyId || !hasCompany) {
      setStats({
        totalProducts: 0,
        totalCustomers: 0,
        lowStockProducts: 0,
        activeCustomers: 0,
        totalSales: 0,
        monthlyRevenue: 0,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all data in parallel
      const [productsRes, customersRes, salesRes] = await Promise.allSettled([
        apiClient.get(`/data/products?company_id=${companyId}`),
        apiClient.get(`/data/customers?company_id=${companyId}`),
        apiClient.get(`/data/sales?company_id=${companyId}`)
      ]);

      let totalProducts = 0;
      let lowStockProducts = 0;
      if (productsRes.status === 'fulfilled') {
        const products = productsRes.value.data || [];
        totalProducts = products.length;
        lowStockProducts = products.filter((p: any) => 
          p.stock_quantity !== null && 
          p.min_stock !== null && 
          p.stock_quantity <= p.min_stock
        ).length;
      }

      let totalCustomers = 0;
      let activeCustomers = 0;
      if (customersRes.status === 'fulfilled') {
        const customers = customersRes.value.data || [];
        totalCustomers = customers.length;
        activeCustomers = customers.filter((c: any) => c.active !== false).length;
      }

      let totalSales = 0;
      let monthlyRevenue = 0;
      if (salesRes.status === 'fulfilled') {
        const sales = salesRes.value.data || [];
        totalSales = sales.length;
        
        // Calculate monthly revenue (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        monthlyRevenue = sales
          .filter((sale: any) => {
            const saleDate = new Date(sale.created_at);
            return saleDate.getMonth() === currentMonth && 
                   saleDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, sale: any) => sum + (sale.total_amount || 0), 0);
      }

      setStats({
        totalProducts,
        totalCustomers,
        lowStockProducts,
        activeCustomers,
        totalSales,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [companyId, hasCompany]);

  return {
    stats,
    loading,
    refreshStats: fetchDashboardStats,
  };
}
