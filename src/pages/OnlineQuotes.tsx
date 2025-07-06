import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { 
  Search, 
  Eye, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  Mail,
  Phone,
  Building2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type OnlineQuote = Tables<'online_quotes'>;

export default function OnlineQuotes() {
  const [quotes, setQuotes] = useState<OnlineQuote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<OnlineQuote | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();
  const { companyId, company } = useCompany();

  useEffect(() => {
    if (companyId) {
      fetchQuotes();
    }
  }, [companyId]);

  const fetchQuotes = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('online_quotes')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar solicitações",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (quoteId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('online_quotes')
        .update({ status })
        .eq('id', quoteId);

      if (error) throw error;

      setQuotes(prev => prev.map(q => 
        q.id === quoteId ? { ...q, status } : q
      ));

      toast({
        title: "Status atualizado!",
        description: `Solicitação marcada como ${getStatusLabel(status)}.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      contacted: { label: 'Contatado', variant: 'default' as const, icon: MessageSquare },
      quoted: { label: 'Orçado', variant: 'default' as const, icon: CheckCircle },
      completed: { label: 'Finalizado', variant: 'default' as const, icon: CheckCircle },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const, icon: XCircle },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const, icon: Clock };
  };

  const getStatusLabel = (status: string) => {
    const statusMap = {
      pending: 'Pendente',
      contacted: 'Contatado',
      quoted: 'Orçado',
      completed: 'Finalizado',
      cancelled: 'Cancelado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/orcamento/${companyId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Link público foi copiado para a área de transferência.",
    });
  };

  const openPublicLink = () => {
    const link = `${window.location.origin}/orcamento/${companyId}`;
    window.open(link, '_blank');
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quote.company_name && quote.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Solicitações de Orçamento</h1>
          <p className="text-muted-foreground">
            Gerencie as solicitações recebidas através do formulário público
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyPublicLink}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar Link Público
          </Button>
          <Button variant="outline" onClick={openPublicLink}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Formulário
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotes.length}</div>
            <p className="text-xs text-muted-foreground">Solicitações recebidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {quotes.filter(q => q.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando contato</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {quotes.filter(q => ['contacted', 'quoted'].includes(q.status || '')).length}
            </div>
            <p className="text-xs text-muted-foreground">Sendo processadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {quotes.filter(q => q.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Results */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="contacted">Contatados</SelectItem>
                  <SelectItem value="quoted">Orçados</SelectItem>
                  <SelectItem value="completed">Finalizados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {quotes.length === 0 ? 
                  "Nenhuma solicitação recebida ainda." : 
                  "Nenhuma solicitação encontrada com os filtros aplicados."
                }
              </div>
            ) : (
              filteredQuotes.map((quote) => {
                const statusBadge = getStatusBadge(quote.status || 'pending');
                const StatusIcon = statusBadge.icon;
                
                return (
                  <Card key={quote.id} className="border">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{quote.customer_name}</h3>
                            <Badge variant={statusBadge.variant} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusBadge.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {quote.customer_email}
                            </div>
                            {quote.customer_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                {quote.customer_phone}
                              </div>
                            )}
                            {quote.company_name && (
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {quote.company_name}
                              </div>
                            )}
                          </div>
                          
                          {quote.message && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {quote.message}
                            </p>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            Recebido em {new Date(quote.created_at || '').toLocaleDateString('pt-BR')} às {new Date(quote.created_at || '').toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuote(quote);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          
                          <Select 
                            value={quote.status || 'pending'} 
                            onValueChange={(status) => updateQuoteStatus(quote.id, status)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="contacted">Contatado</SelectItem>
                              <SelectItem value="quoted">Orçado</SelectItem>
                              <SelectItem value="completed">Finalizado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nome</Label>
                  <p className="text-sm">{selectedQuote.customer_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{selectedQuote.customer_email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm">{selectedQuote.customer_phone || 'Não informado'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Empresa</Label>
                  <p className="text-sm">{selectedQuote.company_name || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mensagem</Label>
                <Textarea
                  value={selectedQuote.message || 'Nenhuma mensagem fornecida.'}
                  readOnly
                  className="bg-muted"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Recebido em {new Date(selectedQuote.created_at || '').toLocaleString('pt-BR')}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const subject = `Sobre sua solicitação de orçamento - ${company?.name}`;
                      const body = `Olá ${selectedQuote.customer_name},\n\nRecebemos sua solicitação de orçamento e entraremos em contato em breve.\n\nAtenciosamente,\n${company?.name}`;
                      window.open(`mailto:${selectedQuote.customer_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                  {selectedQuote.customer_phone && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const message = `Olá ${selectedQuote.customer_name}, recebemos sua solicitação de orçamento da ${company?.name} e entraremos em contato em breve!`;
                        window.open(`https://wa.me/55${selectedQuote.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`);
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}