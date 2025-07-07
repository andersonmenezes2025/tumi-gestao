import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Globe, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuotes } from '@/hooks/useQuotes';
import { QuoteForm } from '@/components/quotes/QuoteForm';
import { QuoteShareDialog } from '@/components/quotes/QuoteShareDialog';
import { OrcamentosHeader } from '@/components/orcamentos/OrcamentosHeader';
import { OrcamentosStats } from '@/components/orcamentos/OrcamentosStats';
import { OrcamentosFilters } from '@/components/orcamentos/OrcamentosFilters';
import { OrcamentosList } from '@/components/orcamentos/OrcamentosList';
import { OrcamentosConfig } from '@/components/orcamentos/OrcamentosConfig';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrcamentosHeader />

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

          <OrcamentosStats quotes={quotes} />
          <OrcamentosFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <OrcamentosList 
            quotes={filteredQuotes}
            onEdit={handleEditQuote}
            onDelete={handleDeleteQuote}
            onShare={handleShareQuote}
          />
        </TabsContent>

        <TabsContent value="online" className="space-y-6">
          <OnlineQuotes />
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <OrcamentosConfig />
        </TabsContent>
      </Tabs>

      <QuoteForm
        open={showQuoteForm}
        onOpenChange={(open) => {
          setShowQuoteForm(open);
          if (!open) setEditingQuote(null);
        }}
        onSubmit={handleSubmitQuote}
        quote={editingQuote}
      />

      <QuoteShareDialog
        quote={shareQuote}
        onClose={() => setShareQuote(null)}
      />
    </div>
  );
};

export default Orcamentos;