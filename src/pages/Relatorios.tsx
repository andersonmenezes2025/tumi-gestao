
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, BarChart, TrendingUp, DollarSign, Users, FileDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { useReports } from '@/hooks/useReports';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Relatorios() {
  const { toast } = useToast();
  const { hasCompany, company } = useCompany();
  const { 
    loading, 
    generateSalesReport, 
    generateFinancialReport, 
    generateCustomersReport, 
    generateProductsReport 
  } = useReports();

  const getReportGenerator = (reportId: string) => {
    switch (reportId) {
      case 'sales': return generateSalesReport;
      case 'financial': return generateFinancialReport;
      case 'customers': return generateCustomersReport;
      case 'products': return generateProductsReport;
      default: return () => {};
    }
  };

  const reportTypes = [
    {
      id: 'sales',
      title: 'Relatório de Vendas',
      description: 'Vendas por período, produtos mais vendidos, performance de vendedores',
      icon: BarChart,
      status: 'available',
    },
    {
      id: 'financial',
      title: 'Relatório Financeiro',
      description: 'Receitas, despesas, fluxo de caixa e indicadores financeiros',
      icon: DollarSign,
      status: 'available',
    },
    {
      id: 'customers',
      title: 'Relatório de Clientes',
      description: 'Cadastros, segmentação, histórico de compras e análise de comportamento',
      icon: Users,
      status: 'available',
    },
    {
      id: 'products',
      title: 'Relatório de Produtos',
      description: 'Estoque, giro de produtos, produtos mais vendidos e análise de performance',
      icon: TrendingUp,
      status: 'available',
    },
  ];

  const handleGenerateReport = (reportId: string, reportTitle: string) => {
    toast({
      title: "Relatório Solicitado",
      description: `O ${reportTitle} será gerado em breve. Você receberá uma notificação quando estiver pronto.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'Disponível', variant: 'default' as const },
      generating: { label: 'Gerando', variant: 'secondary' as const },
      unavailable: { label: 'Indisponível', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  if (!hasCompany) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios</CardTitle>
            <CardDescription>
              Você precisa estar associado a uma empresa para acessar relatórios.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises e relatórios detalhados do seu negócio - {company?.name || 'Sua Empresa'}
          </p>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 15.350,00</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+25% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 108,10</div>
            <p className="text-xs text-muted-foreground">-3% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Tipos de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const statusBadge = getStatusBadge(report.status);
          
          return (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                    </div>
                  </div>
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        disabled={report.status !== 'available' || loading}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {loading ? 'Gerando...' : 'Gerar Relatório'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => getReportGenerator(report.id)('pdf')}>
                        <FileDown className="h-4 w-4 mr-2" />
                        PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => getReportGenerator(report.id)('excel')}>
                        <FileDown className="h-4 w-4 mr-2" />
                        Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
          <CardDescription>Últimos relatórios gerados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <BarChart className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Relatório de Vendas - Janeiro 2024</p>
                  <p className="text-sm text-muted-foreground">Gerado em 15/01/2024 14:30</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Relatório Financeiro - Dezembro 2023</p>
                  <p className="text-sm text-muted-foreground">Gerado em 02/01/2024 09:15</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
