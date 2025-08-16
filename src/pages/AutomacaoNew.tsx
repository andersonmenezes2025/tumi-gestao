import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Brain, Zap, Plus, Settings } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { N8NWebhookConfig } from '@/components/automation/N8NWebhookConfig';
import { AIInsightsDashboard } from '@/components/automation/AIInsightsDashboard';
import { AutomationFlowBuilder } from '@/components/automation/AutomationFlowBuilder';
import { AutomationTemplates } from '@/components/automation/AutomationTemplates';
import { AIRecommendations } from '@/components/automation/AIRecommendations';

export default function AutomacaoNew() {
  const { hasCompany, company } = useCompany();

  if (!hasCompany) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>IA & Automação</CardTitle>
            <CardDescription>
              Você precisa estar associado a uma empresa para acessar automações.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            IA & Automação
          </h1>
          <p className="text-muted-foreground">
            Centro de comando inteligente para {company?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <N8NWebhookConfig />
          <AutomationTemplates />
          <AutomationFlowBuilder />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Automações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Executando agora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Insights de IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Aguardando ação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Economia de Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12h</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">240%</div>
            <p className="text-xs text-muted-foreground">Último trimestre</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="insights" className="gap-2">
            <Brain className="h-4 w-4" />
            Insights IA
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Bot className="h-4 w-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="flows" className="gap-2">
            <Zap className="h-4 w-4" />
            Fluxos
          </TabsTrigger>
          <TabsTrigger value="assistant" className="gap-2">
            <Settings className="h-4 w-4" />
            Assistente
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          <AIInsightsDashboard />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <AIRecommendations />
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxos de Automação</CardTitle>
              <CardDescription>
                Crie e gerencie fluxos automatizados personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <AutomationFlowBuilder 
                  trigger={
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Fluxo
                    </Button>
                  }
                />
                <AutomationTemplates 
                  trigger={
                    <Button variant="outline" className="gap-2">
                      <Bot className="h-4 w-4" />
                      Templates
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assistente Digital</CardTitle>
              <CardDescription>
                Configure seu assistente digital com integração N8N
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Bot className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Assistente Inteligente</h3>
                      <p className="text-sm text-muted-foreground">
                        Conectado via N8N para automação avançada
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <N8NWebhookConfig />
                    <Badge variant="outline">Em Desenvolvimento</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Gerencie integrações e configurações de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <N8NWebhookConfig 
                  trigger={
                    <Button className="w-full gap-2">
                      <Settings className="h-4 w-4" />
                      Configurar N8N Webhook
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}