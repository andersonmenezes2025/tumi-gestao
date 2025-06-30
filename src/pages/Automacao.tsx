
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Settings, Play, Pause, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';

export default function Automacao() {
  const { toast } = useToast();
  const { hasCompany, company } = useCompany();

  const automations = [
    {
      id: '1',
      name: 'Email de Boas-vindas',
      description: 'Enviar email automático para novos clientes cadastrados',
      status: 'active',
      type: 'email',
      triggers: 2,
      lastRun: '2024-01-16 10:30',
    },
    {
      id: '2',
      name: 'Lembrete de Pagamento',
      description: 'Notificar clientes sobre faturas próximas ao vencimento',
      status: 'paused',
      type: 'notification',
      triggers: 5,
      lastRun: '2024-01-15 08:00',
    },
    {
      id: '3',
      name: 'Atualização de Estoque',
      description: 'Alertar quando produtos estiverem com estoque baixo',
      status: 'active',
      type: 'alert',
      triggers: 12,
      lastRun: '2024-01-16 14:20',
    },
  ];

  const aiFeatures = [
    {
      id: 'chatbot',
      title: 'Chatbot Inteligente',
      description: 'Atendimento automatizado com IA para seus clientes',
      status: 'available',
    },
    {
      id: 'recommendation',
      title: 'Recomendações de Produtos',
      description: 'Sugestões personalizadas baseadas no histórico do cliente',
      status: 'beta',
    },
    {
      id: 'prediction',
      title: 'Previsão de Demanda',
      description: 'Análise preditiva para planejamento de estoque',
      status: 'coming_soon',
    },
  ];

  const handleCreateAutomation = () => {
    toast({
      title: "Nova Automação",
      description: "Funcionalidade de criação de automações será implementada em breve.",
    });
  };

  const handleToggleAutomation = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toast({
      title: "Automação Atualizada",
      description: `Automação ${newStatus === 'active' ? 'ativada' : 'pausada'} com sucesso.`,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativa', variant: 'default' as const },
      paused: { label: 'Pausada', variant: 'secondary' as const },
      error: { label: 'Erro', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  const getAiStatusBadge = (status: string) => {
    const statusMap = {
      available: { label: 'Disponível', variant: 'default' as const },
      beta: { label: 'Beta', variant: 'secondary' as const },
      coming_soon: { label: 'Em Breve', variant: 'outline' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">IA & Automação</h1>
          <p className="text-muted-foreground">
            Automatize processos e utilize IA para otimizar seu negócio - {company?.name}
          </p>
        </div>
        <Button onClick={handleCreateAutomation} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Automação
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Automações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">De 3 configuradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19</div>
            <p className="text-xs text-muted-foreground">Tarefas executadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>
      </div>

      {/* Recursos de IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Recursos de Inteligência Artificial
          </CardTitle>
          <CardDescription>
            Potencialize seu negócio com recursos de IA avançados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiFeatures.map((feature) => {
              const statusBadge = getAiStatusBadge(feature.status);
              
              return (
                <div key={feature.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{feature.title}</h3>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                  <Button 
                    size="sm" 
                    disabled={feature.status === 'coming_soon'}
                    className="w-full"
                  >
                    {feature.status === 'available' ? 'Configurar' : 
                     feature.status === 'beta' ? 'Testar Beta' : 'Em Breve'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Automações */}
      <Card>
        <CardHeader>
          <CardTitle>Automações Configuradas</CardTitle>
          <CardDescription>Gerencie suas automações existentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automations.map((automation) => {
              const statusBadge = getStatusBadge(automation.status);
              
              return (
                <div key={automation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{automation.name}</h3>
                      <p className="text-sm text-muted-foreground">{automation.description}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {automation.triggers} execuções
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Última: {automation.lastRun}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAutomation(automation.id, automation.status)}
                    >
                      {automation.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
