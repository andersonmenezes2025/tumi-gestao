
import React, { useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { useDashboard } from '@/hooks/useDashboard';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/contexts/AuthContext';
import { useTestCompany } from '@/hooks/useTestCompany';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Building
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { stats, loading: dashboardLoading } = useDashboard();
  const { hasCompany, error: companyError, loading: companyLoading } = useCompany();
  const { refreshProfile, error: authError } = useAuth();
  const { createTestCompany } = useTestCompany();

  console.log('Dashboard render - companyLoading:', companyLoading, 'hasCompany:', hasCompany, 'authError:', authError, 'companyError:', companyError);

  const handleRefresh = async () => {
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const handleCreateTestCompany = async () => {
    try {
      await createTestCompany();
    } catch (error) {
      console.error('Error creating test company:', error);
    }
  };

  // Auto-create test company if none exists
  useEffect(() => {
    if (!companyLoading && !hasCompany && !companyError) {
      console.log('No company found, creating test company...');
      handleCreateTestCompany();
    }
  }, [companyLoading, hasCompany, companyError]);

  // Loading state
  if (companyLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (authError || companyError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-red-600">Erro ao carregar dados</h2>
            <p className="text-muted-foreground mt-2">
              {authError || companyError || 'Erro desconhecido ao carregar o sistema'}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={handleCreateTestCompany} variant="outline">
              <Building className="h-4 w-4 mr-2" />
              Criar Empresa de Teste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No company state
  if (!hasCompany) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4 max-w-md">
          <Building className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-xl font-semibold">Configurando sua empresa</h2>
            <p className="text-muted-foreground">
              Estamos criando os dados da sua empresa. Isso pode levar alguns segundos...
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleCreateTestCompany}>
              <Building className="h-4 w-4 mr-2" />
              Criar Empresa de Teste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta! Aqui está um resumo do seu negócio.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
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
  );
};

export default Dashboard;
