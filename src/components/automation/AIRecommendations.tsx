import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Star,
  CheckCircle,
  X,
  ArrowRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';

interface AIRecommendation {
  id: string;
  type: 'automation' | 'optimization' | 'strategy' | 'integration';
  category: 'sales' | 'marketing' | 'finance' | 'customer' | 'inventory';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedROI: number;
  timeToImplement: string;
  confidence: number;
  reasoning: string[];
  benefits: string[];
  steps: string[];
  requiredIntegrations?: string[];
  status: 'new' | 'in_progress' | 'completed' | 'dismissed';
  icon: React.ReactNode;
  metrics?: {
    currentValue?: number;
    projectedValue?: number;
    improvement?: string;
  };
}

const mockRecommendations: AIRecommendation[] = [
  {
    id: '1',
    type: 'automation',
    category: 'sales',
    title: 'Automatizar Follow-up de Vendas',
    description: 'Implemente um sistema automatizado de acompanhamento pós-venda para aumentar satisfação e gerar upsells.',
    impact: 'high',
    difficulty: 'medium',
    estimatedROI: 180,
    timeToImplement: '2-3 dias',
    confidence: 92,
    reasoning: [
      'Apenas 15% dos clientes recebem follow-up atualmente',
      'Empresas similares veem 25% de aumento em vendas repetidas',
      'Você tem dados suficientes para personalizar mensagens'
    ],
    benefits: [
      'Aumento de 25% em vendas repetidas',
      'Melhora na satisfação do cliente',
      'Redução de 70% no tempo manual de follow-up'
    ],
    steps: [
      'Configurar trigger para "venda finalizada"',
      'Criar templates de email personalizados',
      'Definir sequência temporal (3 dias, 1 semana, 1 mês)',
      'Integrar com WhatsApp Business',
      'Configurar métricas de acompanhamento'
    ],
    requiredIntegrations: ['Email', 'WhatsApp'],
    status: 'new',
    icon: <TrendingUp className="h-5 w-5" />,
    metrics: {
      currentValue: 15,
      projectedValue: 40,
      improvement: '+25% vendas repetidas'
    }
  },
  {
    id: '2',
    type: 'optimization',
    category: 'inventory',
    title: 'Sistema Inteligente de Reposição',
    description: 'Use IA para prever demanda e automatizar pedidos de reposição, evitando rupturas e excesso de estoque.',
    impact: 'high',
    difficulty: 'hard',
    estimatedROI: 240,
    timeToImplement: '1-2 semanas',
    confidence: 87,
    reasoning: [
      'Histórico mostra 12 rupturas de estoque nos últimos 3 meses',
      'Produtos sazonais podem ser otimizados com IA',
      'Atual método manual é 40% menos eficiente'
    ],
    benefits: [
      'Redução de 80% nas rupturas de estoque',
      'Diminuição de 30% no capital imobilizado',
      'Aumento de 15% na satisfação do cliente'
    ],
    steps: [
      'Analisar histórico de vendas e sazonalidade',
      'Implementar algoritmo de previsão de demanda',
      'Configurar alertas automáticos',
      'Integrar com sistema de fornecedores',
      'Criar dashboard de monitoramento'
    ],
    requiredIntegrations: ['Sistema de Estoque', 'Email', 'Fornecedores'],
    status: 'new',
    icon: <BarChart3 className="h-5 w-5" />,
    metrics: {
      currentValue: 12,
      projectedValue: 2,
      improvement: '-80% rupturas'
    }
  },
  {
    id: '3',
    type: 'strategy',
    category: 'marketing',
    title: 'Segmentação Inteligente de Clientes',
    description: 'Crie campanhas personalizadas baseadas em comportamento de compra e valor do cliente.',
    impact: 'medium',
    difficulty: 'medium',
    estimatedROI: 150,
    timeToImplement: '3-5 dias',
    confidence: 85,
    reasoning: [
      'Análise mostra 3 segmentos distintos de clientes',
      'Campanhas genéricas têm apenas 8% de conversão',
      'Personalização pode aumentar conversão em 300%'
    ],
    benefits: [
      'Aumento de 300% na conversão de campanhas',
      'Maior engajamento dos clientes',
      'ROI 150% superior em marketing'
    ],
    steps: [
      'Analisar dados de compras dos últimos 12 meses',
      'Identificar padrões de comportamento',
      'Criar personas automáticas',
      'Desenvolver campanhas segmentadas',
      'Implementar testes A/B automatizados'
    ],
    requiredIntegrations: ['Email Marketing', 'WhatsApp', 'Analytics'],
    status: 'new',
    icon: <Target className="h-5 w-5" />,
    metrics: {
      currentValue: 8,
      projectedValue: 32,
      improvement: '+300% conversão'
    }
  },
  {
    id: '4',
    type: 'automation',
    category: 'finance',
    title: 'Cobrança Inteligente Escalonada',
    description: 'Automatize cobrança com IA que personaliza abordagem baseada no perfil e histórico do cliente.',
    impact: 'critical',
    difficulty: 'medium',
    estimatedROI: 320,
    timeToImplement: '4-6 dias',
    confidence: 94,
    reasoning: [
      'R$ 45.000 em atraso nos últimos 60 dias',
      'Taxa de recuperação manual é apenas 35%',
      'IA pode identificar melhor estratégia por cliente'
    ],
    benefits: [
      'Aumento de 85% na taxa de recuperação',
      'Redução de 60% no tempo de cobrança',
      'Melhora na relação com clientes inadimplentes'
    ],
    steps: [
      'Analisar histórico de pagamentos por cliente',
      'Criar algoritmo de scoring de risco',
      'Desenvolver templates personalizados',
      'Configurar escalonamento automático',
      'Integrar com sistema financeiro'
    ],
    requiredIntegrations: ['Sistema Financeiro', 'Email', 'WhatsApp'],
    status: 'new',
    icon: <DollarSign className="h-5 w-5" />,
    metrics: {
      currentValue: 35,
      projectedValue: 65,
      improvement: '+85% recuperação'
    }
  }
];

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(mockRecommendations);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  
  const { toast } = useToast();
  const { company } = useCompany();

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
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

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'Crítico';
      case 'high':
        return 'Alto';
      case 'medium':
        return 'Médio';
      case 'low':
        return 'Baixo';
      default:
        return impact;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return difficulty;
    }
  };

  const implementRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id
          ? { ...rec, status: 'in_progress' }
          : rec
      )
    );
    
    toast({
      title: 'Implementação Iniciada',
      description: 'A recomendação foi marcada como em progresso.',
    });
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id
          ? { ...rec, status: 'dismissed' }
          : rec
      )
    );
    
    toast({
      title: 'Recomendação Descartada',
      description: 'A recomendação foi removida da lista.',
    });
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory === 'all') return rec.status === 'new';
    return rec.category === selectedCategory && rec.status === 'new';
  });

  const categories = [
    { value: 'all', label: 'Todas', icon: <Lightbulb className="h-4 w-4" /> },
    { value: 'sales', label: 'Vendas', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'marketing', label: 'Marketing', icon: <Target className="h-4 w-4" /> },
    { value: 'finance', label: 'Financeiro', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'customer', label: 'Clientes', icon: <Users className="h-4 w-4" /> },
    { value: 'inventory', label: 'Estoque', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  const activeRecommendations = recommendations.filter(r => r.status === 'new');
  const criticalRecommendations = activeRecommendations.filter(r => r.impact === 'critical');
  const avgROI = activeRecommendations.reduce((acc, r) => acc + r.estimatedROI, 0) / activeRecommendations.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Recomendações de IA
          </h2>
          <p className="text-muted-foreground">
            Sugestões personalizadas para {company?.name}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recomendações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">Aguardando implementação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-red-500" />
              Críticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">Alta prioridade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round(avgROI)}%</div>
            <p className="text-xs text-muted-foreground">Retorno estimado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Implementadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {recommendations.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recomendações Inteligentes</CardTitle>
              <CardDescription>
                Sugestões baseadas na análise dos seus dados
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="gap-2"
                >
                  {category.icon}
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma recomendação disponível nesta categoria
                  </p>
                </div>
              ) : (
                filteredRecommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {recommendation.icon}
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{recommendation.title}</h3>
                              <Badge variant={getImpactColor(recommendation.impact)}>
                                {getImpactLabel(recommendation.impact)}
                              </Badge>
                              <Badge className={getDifficultyColor(recommendation.difficulty)}>
                                {getDifficultyLabel(recommendation.difficulty)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {recommendation.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => implementRecommendation(recommendation.id)}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Implementar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dismissRecommendation(recommendation.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Metrics Row */}
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-green-600">
                              +{recommendation.estimatedROI}%
                            </div>
                            <div className="text-muted-foreground">ROI</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{recommendation.timeToImplement}</div>
                            <div className="text-muted-foreground">Tempo</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{recommendation.confidence}%</div>
                            <div className="text-muted-foreground">Confiança</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">
                              {recommendation.metrics?.improvement}
                            </div>
                            <div className="text-muted-foreground">Melhoria</div>
                          </div>
                        </div>

                        {/* Confidence Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confiança da IA</span>
                            <span>{recommendation.confidence}%</span>
                          </div>
                          <Progress value={recommendation.confidence} />
                        </div>

                        {/* Benefits Preview */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Principais Benefícios:</h4>
                          <div className="flex flex-wrap gap-1">
                            {recommendation.benefits.slice(0, 2).map((benefit, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                            {recommendation.benefits.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{recommendation.benefits.length - 2} mais
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecommendation(recommendation)}
                          className="w-full gap-2"
                        >
                          Ver Detalhes Completos
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detailed Recommendation Modal */}
      {selectedRecommendation && (
        <Dialog 
          open={!!selectedRecommendation} 
          onOpenChange={() => setSelectedRecommendation(null)}
        >
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRecommendation.icon}
                {selectedRecommendation.title}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <p>{selectedRecommendation.description}</p>
              
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    +{selectedRecommendation.estimatedROI}%
                  </div>
                  <div className="text-sm text-muted-foreground">ROI Estimado</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedRecommendation.timeToImplement}
                  </div>
                  <div className="text-sm text-muted-foreground">Implementação</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedRecommendation.confidence}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confiança</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {getDifficultyLabel(selectedRecommendation.difficulty)}
                  </div>
                  <div className="text-sm text-muted-foreground">Dificuldade</div>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <h4 className="font-medium mb-2">Por que recomendamos:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  {selectedRecommendation.reasoning.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h4 className="font-medium mb-2">Benefícios esperados:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-green-700">
                  {selectedRecommendation.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>

              {/* Implementation Steps */}
              <div>
                <h4 className="font-medium mb-2">Passos para implementação:</h4>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  {selectedRecommendation.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Required Integrations */}
              {selectedRecommendation.requiredIntegrations && (
                <div>
                  <h4 className="font-medium mb-2">Integrações necessárias:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecommendation.requiredIntegrations.map((integration) => (
                      <Badge key={integration} variant="outline">
                        {integration}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    implementRecommendation(selectedRecommendation.id);
                    setSelectedRecommendation(null);
                  }}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Implementar Agora
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedRecommendation(null)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}