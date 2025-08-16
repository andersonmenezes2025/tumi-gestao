import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Eye,
  X,
  RefreshCw,
  BarChart3,
  ShoppingCart,
  DollarSign,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';

interface AIInsight {
  id: string;
  type: 'sales_prediction' | 'product_recommendation' | 'financial_analysis' | 'customer_behavior';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'dismissed' | 'implemented';
  data: any;
  createdAt: Date;
  validUntil?: Date;
}

const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'sales_prediction',
    title: 'Aumento nas Vendas Previsto',
    description: 'Com base no histórico dos últimos 3 meses, prevemos um aumento de 23% nas vendas para a próxima semana.',
    confidence: 0.87,
    priority: 'high',
    status: 'active',
    data: {
      predicted_increase: 23,
      current_sales: 15000,
      predicted_sales: 18450,
      factors: ['Sazonalidade', 'Promoções planejadas', 'Tendência de mercado']
    },
    createdAt: new Date('2024-01-16T10:00:00'),
    validUntil: new Date('2024-01-23T23:59:59')
  },
  {
    id: '2',
    type: 'product_recommendation',
    title: 'Produtos para Cross-selling',
    description: 'Clientes que compraram "Smartphone XYZ" têm 68% de chance de comprar "Capinha Premium".',
    confidence: 0.68,
    priority: 'medium',
    status: 'active',
    data: {
      main_product: 'Smartphone XYZ',
      recommended_products: ['Capinha Premium', 'Película Protetora', 'Carregador Wireless'],
      conversion_rates: [68, 45, 32]
    },
    createdAt: new Date('2024-01-16T09:30:00')
  },
  {
    id: '3',
    type: 'financial_analysis',
    title: 'Fluxo de Caixa: Atenção Necessária',
    description: 'Prevemos um déficit de R$ 8.500 no fluxo de caixa em 15 dias se as contas a receber não forem cobradas.',
    confidence: 0.92,
    priority: 'urgent',
    status: 'active',
    data: {
      predicted_deficit: -8500,
      overdue_amount: 12000,
      upcoming_expenses: 25000,
      recommendations: ['Intensificar cobrança', 'Renegociar prazos com fornecedores']
    },
    createdAt: new Date('2024-01-16T08:15:00')
  },
  {
    id: '4',
    type: 'customer_behavior',
    title: 'Segmento de Alto Valor',
    description: 'Identificamos 15 clientes com potencial de aumentar compras em 40% com ofertas personalizadas.',
    confidence: 0.75,
    priority: 'medium',
    status: 'active',
    data: {
      high_value_customers: 15,
      potential_increase: 40,
      total_potential_revenue: 22000,
      suggested_actions: ['Programa VIP', 'Desconto escalonado', 'Atendimento prioritário']
    },
    createdAt: new Date('2024-01-16T07:45:00')
  }
];

export function AIInsightsDashboard() {
  const [insights, setInsights] = useState<AIInsight[]>(mockInsights);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { company } = useCompany();

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'sales_prediction':
        return <TrendingUp className="h-5 w-5" />;
      case 'product_recommendation':
        return <ShoppingCart className="h-5 w-5" />;
      case 'financial_analysis':
        return <DollarSign className="h-5 w-5" />;
      case 'customer_behavior':
        return <Users className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityLabel = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const dismissInsight = (id: string) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === id 
          ? { ...insight, status: 'dismissed' }
          : insight
      )
    );
    toast({
      title: 'Insight Descartado',
      description: 'O insight foi marcado como descartado.',
    });
  };

  const implementInsight = (id: string) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === id 
          ? { ...insight, status: 'implemented' }
          : insight
      )
    );
    toast({
      title: 'Insight Implementado',
      description: 'O insight foi marcado como implementado.',
    });
  };

  const refreshInsights = async () => {
    setIsRefreshing(true);
    // Simular chamada à API
    setTimeout(() => {
      toast({
        title: 'Insights Atualizados',
        description: 'Os insights foram atualizados com os dados mais recentes.',
      });
      setIsRefreshing(false);
    }, 2000);
  };

  const filteredInsights = insights.filter(insight => {
    if (selectedTab === 'all') return insight.status === 'active';
    if (selectedTab === 'urgent') return insight.priority === 'urgent' && insight.status === 'active';
    if (selectedTab === 'implemented') return insight.status === 'implemented';
    return insight.type === selectedTab && insight.status === 'active';
  });

  const activeInsights = insights.filter(insight => insight.status === 'active');
  const urgentInsights = activeInsights.filter(insight => insight.priority === 'urgent');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Insights de IA
          </h2>
          <p className="text-muted-foreground">
            Análises inteligentes para {company?.name}
          </p>
        </div>
        <Button onClick={refreshInsights} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInsights.length}</div>
            <p className="text-xs text-muted-foreground">Ativos no momento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentInsights.length}</div>
            <p className="text-xs text-muted-foreground">Requer ação imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confiança Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(activeInsights.reduce((acc, insight) => acc + insight.confidence, 0) / activeInsights.length * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Precisão dos insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Implementados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {insights.filter(i => i.status === 'implemented').length}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Análises Inteligentes</CardTitle>
          <CardDescription>
            Insights gerados automaticamente pela IA com base nos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="urgent">Urgentes</TabsTrigger>
              <TabsTrigger value="sales_prediction">Vendas</TabsTrigger>
              <TabsTrigger value="financial_analysis">Financeiro</TabsTrigger>
              <TabsTrigger value="customer_behavior">Clientes</TabsTrigger>
              <TabsTrigger value="implemented">Implementados</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredInsights.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhum insight disponível nesta categoria
                      </p>
                    </div>
                  ) : (
                    filteredInsights.map((insight) => (
                      <Card key={insight.id} className="relative">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getInsightIcon(insight.type)}
                              <div className="space-y-1">
                                <h3 className="font-semibold">{insight.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {insight.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(insight.priority)}>
                                {getPriorityLabel(insight.priority)}
                              </Badge>
                              {insight.status === 'active' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => implementInsight(insight.id)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => dismissInsight(insight.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Confidence Score */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Confiança</span>
                                <span>{Math.round(insight.confidence * 100)}%</span>
                              </div>
                              <Progress value={insight.confidence * 100} />
                            </div>

                            {/* Insight Data */}
                            {insight.type === 'sales_prediction' && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Vendas Atuais:</span>
                                  <p>R$ {insight.data.current_sales?.toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Vendas Previstas:</span>
                                  <p className="text-green-600">R$ {insight.data.predicted_sales?.toLocaleString()}</p>
                                </div>
                              </div>
                            )}

                            {insight.type === 'financial_analysis' && (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">Déficit Previsto:</span>
                                  <span className="text-red-600">
                                    R$ {Math.abs(insight.data.predicted_deficit)?.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Valores em Atraso:</span>
                                  <span>R$ {insight.data.overdue_amount?.toLocaleString()}</span>
                                </div>
                              </div>
                            )}

                            {/* Valid Until */}
                            {insight.validUntil && (
                              <div className="text-xs text-muted-foreground border-t pt-2">
                                Válido até: {insight.validUntil.toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}