
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useDashboard } from '@/hooks/useDashboard';
import { useCompany } from '@/hooks/useCompany';
import { Loader2, Plus, Database, Package, Users, ShoppingCart, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { stats, loading: statsLoading } = useDashboard();
  const { hasCompany, company, loading: companyLoading, error } = useCompany();

  const loading = companyLoading || statsLoading;

  console.log('Dashboard - Has Company:', hasCompany, 'Company:', company);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasCompany) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao GestãoPro!</CardTitle>
            <CardDescription>
              Para começar a usar o sistema, você precisa criar ou estar associado a uma empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                Entrar em Empresa Existente
              </Button>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio - {company?.name || 'Sua Empresa'}
          </p>
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Produtos"
          value={stats.totalProducts}
          change="Total cadastrado"
          icon={Package}
        />
        <StatsCard
          title="Clientes"
          value={stats.totalCustomers}
          change={`${stats.activeCustomers} ativos`}
          icon={Users}
        />
        <StatsCard
          title="Vendas"
          value={stats.totalSales}
          change="Este mês"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Receita"
          value={`R$ ${stats.monthlyRevenue.toFixed(2).replace('.', ',')}`}
          change="Este mês"
          icon={DollarSign}
        />
      </div>

      {/* Gráficos e atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <RecentActivity />
      </div>

      {/* Ações rápidas */}
      <QuickActions />

      {/* Alertas de estoque baixo */}
      {stats.lowStockProducts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-600">Atenção: Estoque Baixo</CardTitle>
            <CardDescription>
              {stats.lowStockProducts} produto(s) com estoque abaixo do mínimo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.href = '/produtos?filter=low-stock'}>
              Ver Produtos com Estoque Baixo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
