import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useCompany } from './useCompany';
import { useToast } from './use-toast';
import { AgendaEvent } from '@/types/database';

interface CreateEventData {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  type?: string;
  status?: string;
}

export function useAgenda() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { companyId } = useCompany();
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await apiClient.get(`/data/agenda_events?company_id=${companyId}&order=start_date:asc`);
      setEvents(response.data || []);
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

  const createEvent = async (eventData: CreateEventData) => {
    if (!companyId) return null;

    try {
      const response = await apiClient.post('/data/agenda_events', {
        ...eventData,
        company_id: companyId,
      });

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso",
      });

      await fetchEvents();
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<CreateEventData>) => {
    try {
      const response = await apiClient.put(`/data/agenda_events/${id}`, eventData);

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso",
      });

      await fetchEvents();
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await apiClient.delete(`/data/agenda_events/${id}`);

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso",
      });

      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir evento",
        variant: "destructive",
      });
    }
  };

  const getTodayEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(event => 
      event.start_date.startsWith(today)
    );
  };

  const getUpcomingEvents = (days = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= today && eventDate <= futureDate;
    });
  };

  const getEventsByStatus = (status: string) => {
    return events.filter(event => event.status === status);
  };

  useEffect(() => {
    if (companyId) {
      fetchEvents();
    }
  }, [companyId]);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    getTodayEvents,
    getUpcomingEvents,
    getEventsByStatus,
    refreshEvents: fetchEvents,
  };
}