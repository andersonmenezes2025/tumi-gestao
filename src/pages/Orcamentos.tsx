import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Send,
  Copy,
  ExternalLink,
  FileText,
  Calendar,
  User,
  DollarSign,
  Globe,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuotes } from '@/hooks/useQuotes';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { QuoteShareDialog } from '@/components/quotes/QuoteShareDialog';
import OnlineQuotes from '@/pages/OnlineQuotes';
import { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;

const Orcamentos: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [shareQuote, setShareQuote] = useState<Quote | null>(null);
  
  const { quotes, loading, createQuote, updateQuote, deleteQuote } = useQuotes();
  const { toast } = useToast();

  const filteredQuotes = quotes.filter(quote =>
    quote.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setShowQuoteForm(true);
  };

  const handleDeleteQuote = async (quote: Quote) => {
    if (window.confirm(`Tem certeza que deseja excluir o orçamento para "${quote.customer_name}"?`)) {
      await deleteQuote(quote.id);
    }
  };

  const handleSubmitQuote = async (quoteData: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingQuote) {
      await updateQuote(editingQuote.id, quoteData);
    } else {
      await createQuote(quoteData);
    }
    setEditingQuote(null);
  };

  const handleShareQuote = (quote: Quote) => {
    setShareQuote(quote);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
      'approved': { label: 'Aprovado', class: 'bg-green-100 text-green-800' },
      'rejected': { label: 'Rejeitado', class: 'bg-red-100 text-red-800' },
      'sent': { label: 'Enviado', class: 'bg-blue-100 text-blue-800' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">Gerencie seus orçamentos e propostas</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="tradicional" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tradicional" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Orçamentos Tradicionais
          </TabsTrigger>
          
          <TabsTrigger value="online" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Orçamentos Online
          </TabsTrigger>
          
          <TabsTrigger value="configuracoes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Orçamentos Tradicionais Tab */}
        <TabsContent value="tradicional" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Orçamentos Tradicionais</h2>
              <p className="text-muted-foreground">Gerencie orçamentos criados internamente</p>
            </div>
            <Button onClick={() => setShowQuoteForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotes.length}</div>
                <p className="text-xs text-muted-foreground">orçamentos criados</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">aguardando resposta</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotes.filter(q => q.status === 'approved').length}</div>
                <p className="text-xs text-muted-foreground">orçamentos aceitos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {quotes.reduce((total, quote) => total + quote.total_amount, 0).toFixed(2).replace('.', ',')}
                </div>
                <p className="text-xs text-muted-foreground">valor total dos orçamentos</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar orçamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Quotes List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Orçamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium">Cliente</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Valor</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Validade</th>
                      <th className="text-left py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotes.map((quote) => (
                      <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{quote.customer_name}</div>
                            {quote.customer_phone && (
                              <div className="text-sm text-gray-500">{quote.customer_phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {quote.customer_email}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          R$ {quote.total_amount.toFixed(2).replace('.', ',')}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(quote.status || 'pending')}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShareQuote(quote)}
                              title="Compartilhar orçamento"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditQuote(quote)}
                              title="Editar orçamento"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuote(quote)}
                              title="Excluir orçamento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredQuotes.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          Nenhum orçamento encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orçamentos Online Tab */}
        <TabsContent value="online" className="space-y-6">
          <OnlineQuotes />
        </TabsContent>

        {/* Configurações Tab */}
        <TabsContent value="configuracoes" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quote-validity">Validade padrão dos orçamentos (dias)</Label>
                  <Input
                    id="quote-validity"
                    type="number"
                    placeholder="30"
                    className="w-32"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quote-notes">Observações padrão</Label>
                  <Textarea
                    id="quote-notes"
                    placeholder="Observações que aparecerão em todos os orçamentos..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Templates de Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Assunto do email</Label>
                  <Input
                    id="email-subject"
                    placeholder="Orçamento - {empresa}"
                    defaultValue="Orçamento - {empresa}"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-body">Corpo do email</Label>
                  <Textarea
                    id="email-body"
                    placeholder="Prezado(a) {cliente},&#10;&#10;Segue em anexo o orçamento solicitado.&#10;&#10;Atenciosamente,&#10;{empresa}"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personalização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-logo" className="rounded" />
                  <Label htmlFor="show-logo">Exibir logo da empresa nos orçamentos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="show-contact" className="rounded" />
                  <Label htmlFor="show-contact">Exibir informações de contato</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="auto-numbering" className="rounded" defaultChecked />
                  <Label htmlFor="auto-numbering">Numeração automática de orçamentos</Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>
                Salvar Configurações
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quote Form Dialog */}
      <QuoteForm
        open={showQuoteForm}
        onOpenChange={(open) => {
          setShowQuoteForm(open);
          if (!open) setEditingQuote(null);
        }}
        onSubmit={handleSubmitQuote}
        quote={editingQuote}
      />

      {/* Quote Share Dialog */}
      <QuoteShareDialog
        quote={shareQuote}
        onClose={() => setShareQuote(null)}
      />
    </div>
  );
};

export default Orcamentos;