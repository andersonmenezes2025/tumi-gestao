
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const Dashboard: React.FC = () => {
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
            value="R$ 12.489"
            change="+12.5% vs mês anterior"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Vendas Hoje"
            value="24"
            change="+8 vs ontem"
            changeType="positive"
            icon={ShoppingCart}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Clientes Ativos"
            value="342"
            change="+5.2% este mês"
            changeType="positive"
            icon={Users}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Produtos em Estoque"
            value="1.247"
            change="12 com estoque baixo"
            changeType="negative"
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
                value="R$ 89,50"
                change="+3.2% vs mês anterior"
                changeType="positive"
                icon={TrendingUp}
                iconColor="text-emerald-500"
              />
              <StatsCard
                title="Produtos em Alerta"
                value="12"
                change="Estoque baixo"
                changeType="negative"
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
