import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { useAIInsights } from '@/hooks/useAIInsights';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  RefreshCw,
  CheckCircle,
  XCircle,
  Brain
} from 'lucide-react';

export function AIInsightsDashboard() {
  const [selectedTab, setSelectedTab] = useState('all');
  const { toast } = useToast();
  const { company } = useCompany();
  const { 
    insights, 
    isLoading, 
    generateInsights, 
    dismissInsight, 
    implementInsight,
    isGenerating,
    getInsightsByType,
    getInsightsByStatus 
  } = useAIInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return <TrendingUp className="h-5 w-5" />;
      case 'inventory':
        return <Package className="h-5 w-5" />;
      case 'financial':
        return <DollarSign className="h-5 w-5" />;
      case 'customer':
        return <Users className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
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

  const handleDismissInsight = async (id: string) => {
    try {
      await dismissInsight(id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao dispensar insight.",
        variant: "destructive"
      });
    }
  };

  const handleImplementInsight = async (id: string) => {
    try {
      await implementInsight(id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao implementar insight.",
        variant: "destructive"
      });
    }
  };

  const handleRefreshInsights = async () => {
    try {
      await generateInsights();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar novos insights.",
        variant: "destructive"
      });
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'urgent') return insight.priority === 'high';
    if (selectedTab === 'implemented') return insight.status === 'implemented';
    return insight.type === selectedTab;
  });

  const urgentInsights = insights.filter(i => i.priority === 'high' && i.status === 'active');
  const totalInsights = insights.length;
  const implementedInsights = insights.filter(i => i.status === 'implemented');
  const avgConfidence = insights.length > 0 
    ? insights.reduce((sum, i) => sum + (i.confidence_score || 0), 0) / insights.length 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshInsights}
          disabled={isGenerating}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Gerando...' : 'Gerar Insights'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInsights}</div>
            <p className="text-xs text-muted-foreground">Insights gerados</p>
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
              {Math.round(avgConfidence * 100)}%
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
              {implementedInsights.length}
            </div>
            <p className="text-xs text-muted-foreground">Este período</p>
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
              <TabsTrigger value="sales">Vendas</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
              <TabsTrigger value="customer">Clientes</TabsTrigger>
              <TabsTrigger value="implemented">Implementados</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredInsights.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {insights.length === 0 
                          ? "Nenhum insight disponível. Clique em 'Gerar Insights' para criar análises." 
                          : "Nenhum insight disponível nesta categoria"
                        }
                      </p>
                      {insights.length === 0 && (
                        <Button 
                          onClick={handleRefreshInsights} 
                          disabled={isGenerating}
                          className="mt-4"
                        >
                          Gerar Primeiros Insights
                        </Button>
                      )}
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
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Confidence Score */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Confiança</span>
                                <span>{Math.round((insight.confidence_score || 0) * 100)}%</span>
                              </div>
                              <Progress 
                                value={(insight.confidence_score || 0) * 100} 
                                className="w-full h-2" 
                              />
                            </div>

                            {/* Action Buttons */}
                            {insight.status === 'active' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDismissInsight(insight.id)}
                                  className="gap-2"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Dispensar
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleImplementInsight(insight.id)}
                                  className="gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Implementar
                                </Button>
                              </div>
                            )}
                            
                            {/* Insight Data */}
                            {insight.data && Object.keys(insight.data).length > 0 && (
                              <div className="text-xs text-muted-foreground border-t pt-2">
                                <details>
                                  <summary className="cursor-pointer">Ver detalhes</summary>
                                  <pre className="mt-2 overflow-x-auto">
                                    {JSON.stringify(insight.data, null, 2)}
                                  </pre>
                                </details>
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