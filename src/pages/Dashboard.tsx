
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/hooks/useCompany';
import { useTestData } from '@/hooks/useTestData';
import { Loader2, TestTube, Plus, Database } from 'lucide-react';

export default function Dashboard() {
  const { stats, loading } = useDashboard();
  const { user, profile, company } = useAuth();
  const { hasCompany } = useCompany();
  const { createCompleteTestData, createTestCompany } = useTestData();

  const handleCreateTestData = async () => {
    await createCompleteTestData();
  };

  const handleCreateTestCompany = async () => {
    await createTestCompany();
  };

  console.log('Dashboard - Auth state:', { user: !!user, profile: !!profile, company: !!company, hasCompany });

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
              <Button onClick={handleCreateTestCompany} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Empresa de Teste
              </Button>
              <Button variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                Entrar em Empresa Existente
              </Button>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Informações do Usuário:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Nome:</strong> {profile?.full_name || 'Não informado'}</p>
                <p><strong>Role:</strong> {profile?.role || 'Não definido'}</p>
                <p><strong>Empresa:</strong> {company?.name || 'Nenhuma empresa associada'}</p>
              </div>
            </div>
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
            Visão geral do seu negócio - {company?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateTestData} variant="outline" className="gap-2">
            <TestTube className="h-4 w-4" />
            Criar Dados de Teste
          </Button>
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Produtos"
          value={stats.totalProducts}
          description="Total cadastrado"
          icon="Package"
        />
        <StatsCard
          title="Clientes"
          value={stats.totalCustomers}
          description={`${stats.activeCustomers} ativos`}
          icon="Users"
        />
        <StatsCard
          title="Vendas"
          value={stats.totalSales}
          description="Este mês"
          icon="ShoppingCart"
        />
        <StatsCard
          title="Receita"
          value={`R$ ${stats.monthlyRevenue.toFixed(2).replace('.', ',')}`}
          description="Este mês"
          icon="DollarSign"
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
            <Button variant="outline">
              Ver Produtos com Estoque Baixo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Informações de debug (apenas para desenvolvimento) */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Usuário ID:</strong> {user?.id}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Nome:</strong> {profile?.full_name || 'Não informado'}</p>
            </div>
            <div>
              <p><strong>Empresa:</strong> {company?.name || 'Não associado'}</p>
              <p><strong>Empresa ID:</strong> {company?.id || 'N/A'}</p>
              <p><strong>Role:</strong> {profile?.role || 'Não definido'}</p>
            </div>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
