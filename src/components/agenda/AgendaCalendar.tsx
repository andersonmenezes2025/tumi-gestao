import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useCompany } from '@/hooks/useCompany';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'pt-BR': ptBR,
  },
});

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface AgendaCalendarProps {
  onNewEvent?: () => void;
}

export function AgendaCalendar({ onNewEvent }: AgendaCalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      // TODO: Implementar tabela de eventos na database
      // Por enquanto, eventos mockados
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Reunião com cliente',
          start: new Date(2025, 0, 20, 10, 0),
          end: new Date(2025, 0, 20, 11, 0),
        },
        {
          id: '2',
          title: 'Entrega de produtos',
          start: new Date(2025, 0, 22, 14, 0),
          end: new Date(2025, 0, 22, 16, 0),
        },
        {
          id: '3',
          title: 'Follow-up vendas',
          start: new Date(2025, 0, 25, 9, 0),
          end: new Date(2025, 0, 25, 10, 0),
        },
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar eventos da agenda",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [companyId]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // TODO: Abrir formulário para criar novo evento
    console.log('New event slot selected:', { start, end });
    onNewEvent?.();
  };

  const handleSelectEvent = (event: Event) => {
    // TODO: Abrir formulário para editar evento
    console.log('Event selected:', event);
  };

  const messages = {
    allDay: 'Dia todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
    showMore: (total: number) => `+ Ver mais (${total})`,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Carregando agenda...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Agenda</h2>
        </div>
        <Button onClick={onNewEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              culture="pt-BR"
              messages={messages}
              view={currentView}
              onView={setCurrentView}
              date={currentDate}
              onNavigate={setCurrentDate}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              popup
              dayLayoutAlgorithm="no-overlap"
              eventPropGetter={(event) => ({
                className: 'bg-primary text-primary-foreground',
                style: {
                  backgroundColor: 'hsl(var(--primary))',
                  borderColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  fontSize: '12px',
                },
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}