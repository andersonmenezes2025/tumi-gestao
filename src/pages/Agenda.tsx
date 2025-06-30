
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Clock, Users, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';

export default function Agenda() {
  const { toast } = useToast();
  const { hasCompany, company } = useCompany();

  // Dados mock para teste
  const events = [
    {
      id: '1',
      title: 'Reunião com Cliente - João Silva',
      description: 'Apresentação de proposta comercial',
      date: '2024-01-16',
      time: '14:00',
      duration: '1h',
      type: 'meeting',
      status: 'confirmed',
      location: 'Escritório Central',
    },
    {
      id: '2',
      title: 'Follow-up Vendas',
      description: 'Acompanhar propostas pendentes',
      date: '2024-01-16',
      time: '16:30',
      duration: '30min',
      type: 'call',
      status: 'pending',
      location: 'Remoto',
    },
    {
      id: '3',
      title: 'Entrega de Produtos - Maria Santos',
      description: 'Entrega de pedido #VD000002',
      date: '2024-01-17',
      time: '09:00',
      duration: '45min',
      type: 'delivery',
      status: 'scheduled',
      location: 'Rua das Flores, 123',
    },
  ];

  const todayEvents = events.filter(event => event.date === '2024-01-16');
  const upcomingEvents = events.filter(event => event.date > '2024-01-16');

  const handleNewEvent = () => {
    toast({
      title: "Novo Agendamento",
      description: "Funcionalidade de novo agendamento será implementada em breve.",
    });
  };

  const getEventTypeBadge = (type: string) => {
    const typeMap = {
      meeting: { label: 'Reunião', variant: 'default' as const },
      call: { label: 'Ligação', variant: 'secondary' as const },
      delivery: { label: 'Entrega', variant: 'outline' as const },
    };
    return typeMap[type as keyof typeof typeMap] || { label: type, variant: 'outline' as const };
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      confirmed: { label: 'Confirmado', variant: 'default' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      scheduled: { label: 'Agendado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  if (!hasCompany) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Agenda</CardTitle>
            <CardDescription>
              Você precisa estar associado a uma empresa para acessar a agenda.
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
          <h1 className="text-3xl font-bold">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus compromissos e agendamentos - {company?.name}
          </p>
        </div>
        <Button onClick={handleNewEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground">Compromissos agendados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Total de eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.status === 'confirmed').length}
            </div>
            <p className="text-xs text-muted-foreground">Eventos confirmados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eventos de Hoje */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Hoje - {new Date().toLocaleDateString('pt-BR')}
            </CardTitle>
            <CardDescription>Seus compromissos para hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum compromisso agendado para hoje</p>
                </div>
              ) : (
                todayEvents.map((event) => {
                  const typeBadge = getEventTypeBadge(event.type);
                  const statusBadge = getStatusBadge(event.status);
                  
                  return (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time} ({event.duration})
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Agenda dos próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const typeBadge = getEventTypeBadge(event.type);
                
                return (
                  <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge variant={typeBadge.variant} className="text-xs">
                        {typeBadge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                );
              })}
              
              {upcomingEvents.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Nenhum evento próximo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
