import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, ExternalLink, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuotes } from '@/hooks/useQuotes';
import { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;

interface QuoteShareDialogProps {
  quote: Quote | null;
  onClose: () => void;
}

export function QuoteShareDialog({ quote, onClose }: QuoteShareDialogProps) {
  const [shareLink, setShareLink] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { generateShareLink } = useQuotes();

  const handleGenerateLink = async () => {
    if (!quote) return;
    
    setGenerating(true);
    try {
      const link = await generateShareLink(quote.id);
      setShareLink(link);
      toast({
        title: "Link gerado com sucesso!",
        description: "Agora você pode compartilhar este orçamento com o cliente.",
      });
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = () => {
    if (shareLink) {
      window.open(shareLink, '_blank');
    }
  };

  // Check if quote already has a public token
  const existingLink = quote?.public_token 
    ? `${window.location.origin}/orcamento/${quote.public_token}`
    : null;

  return (
    <Dialog open={!!quote} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Orçamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-medium">{quote?.customer_name}</h3>
                <p className="text-sm text-gray-600">{quote?.customer_email}</p>
                <p className="text-lg font-semibold">
                  R$ {quote?.total_amount.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </CardContent>
          </Card>

          {existingLink || shareLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Link do Orçamento</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareLink || existingLink || ''}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    disabled={!shareLink && !existingLink}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleOpenLink}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  onClick={handleCopyLink}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Gere um link público para compartilhar este orçamento com o cliente.
              </p>
              <Button
                onClick={handleGenerateLink}
                disabled={generating}
                className="w-full"
              >
                {generating ? 'Gerando Link...' : 'Gerar Link de Compartilhamento'}
              </Button>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}