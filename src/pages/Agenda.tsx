import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Clock, Users, MapPin, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { useAgenda } from '@/hooks/useAgenda';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Agenda() {
  const { toast } = useToast();
  const { hasCompany, company } = useCompany();
  const { 
    events, 
    loading, 
    createEvent, 
    getTodayEvents, 
    getEventsByStatus 
  } = useAgenda();
  
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '1',
    type: 'meeting',
    location: '',
  });

  const handleSaveEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos título, data e horário.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const startDateTime = new Date(`${newEvent.date}T${newEvent.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (parseInt(newEvent.duration) * 60 * 60 * 1000));

      await createEvent({
        title: newEvent.title,
        description: newEvent.description,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        location: newEvent.location,
        type: newEvent.type,
        status: 'scheduled',
      });

      setShowNewEventDialog(false);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '1',
        type: 'meeting',
        location: '',
      });
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setSaving(false);
    }
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

  const todayEvents = getTodayEvents();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
        <Button onClick={() => setShowNewEventDialog(true)} className="gap-2">
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
              {getEventsByStatus('confirmed').length}
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
              {getEventsByStatus('pending').length + getEventsByStatus('scheduled').length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
          </CardContent>
        </Card>
      </div>

      {/* Eventos de Hoje */}
      <Card>
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
                const typeBadge = getEventTypeBadge(event.type || 'meeting');
                const statusBadge = getStatusBadge(event.status || 'scheduled');
                
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
                        {format(new Date(event.start_date), 'HH:mm', { locale: ptBR })} - {format(new Date(event.end_date), 'HH:mm', { locale: ptBR })}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Novo Evento */}
      <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Ex: Reunião com cliente"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Descreva o agendamento"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duração (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="call">Ligação</SelectItem>
                    <SelectItem value="delivery">Entrega</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Ex: Escritório Central"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewEventDialog(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEvent} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}