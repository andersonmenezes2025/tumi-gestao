
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { useDashboard } from '@/hooks/useDashboard';
import { useCompany } from '@/hooks/useCompany';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { stats, loading } = useDashboard();
  const { hasCompany } = useCompany();

  console.log('Dashboard render - loading:', loading, 'hasCompany:', hasCompany);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasCompany) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <Package className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-xl font-semibold">Nenhuma empresa encontrada</h2>
              <p className="text-muted-foreground">
                Parece que você ainda não está associado a uma empresa.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta! Aqui está um resumo do seu negócio.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Receita Mensal"
            value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change="Mês atual"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Vendas Total"
            value={stats.totalSales.toString()}
            change="Todas as vendas"
            changeType="positive"
            icon={ShoppingCart}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Clientes Ativos"
            value={stats.activeCustomers.toString()}
            change={`${stats.totalCustomers} total`}
            changeType="positive"
            icon={Users}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Produtos Cadastrados"
            value={stats.totalProducts.toString()}
            change={`${stats.lowStockProducts} com estoque baixo`}
            changeType={stats.lowStockProducts > 0 ? "negative" : "positive"}
            icon={Package}
            iconColor="text-orange-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SalesChart />
            
            {/* Additional KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard
                title="Ticket Médio"
                value={stats.totalSales > 0 
                  ? `R$ ${(stats.monthlyRevenue / stats.totalSales).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : "R$ 0,00"
                }
                change="Por venda"
                changeType="positive"
                icon={TrendingUp}
                iconColor="text-emerald-500"
              />
              <StatsCard
                title="Produtos em Alerta"
                value={stats.lowStockProducts.toString()}
                change="Estoque baixo"
                changeType={stats.lowStockProducts > 0 ? "negative" : "positive"}
                icon={AlertTriangle}
                iconColor="text-red-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
