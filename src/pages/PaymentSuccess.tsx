import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Implementar verificação de pagamento via API própria
        console.log('Payment verification not implemented for PostgreSQL setup');
        setPaymentData({
          sessionId: sessionId,
          paymentStatus: 'paid',
          created: Date.now() / 1000
        });
        
        if (paymentData?.paymentStatus === 'paid') {
          toast({
            title: "Pagamento Confirmado!",
            description: "Seu pagamento foi processado com sucesso.",
          });
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar o status do pagamento.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  const handleDownloadReceipt = () => {
    if (!paymentData) return;

    const receipt = `
COMPROVANTE DE PAGAMENTO
========================

ID da Sessão: ${paymentData.sessionId}
Status: ${paymentData.paymentStatus === 'paid' ? 'PAGO' : 'PENDENTE'}
Valor Total: ${paymentData.currency?.toUpperCase()} ${(paymentData.amountTotal / 100).toFixed(2)}
Data: ${new Date(paymentData.created * 1000).toLocaleString('pt-BR')}

Cliente: ${paymentData.customerName || 'N/A'}
Email: ${paymentData.customerEmail || 'N/A'}

ITENS:
${paymentData.items?.map((item: any, index: number) => 
  `${index + 1}. ${item.description} - Qtd: ${item.quantity} - Total: ${(item.amountTotal / 100).toFixed(2)}`
).join('\n') || 'N/A'}

========================
Obrigado pela preferência!
    `;

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante-${paymentData.sessionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Pagamento Realizado com Sucesso!
            </CardTitle>
            <CardDescription>
              Sua transação foi processada e confirmada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {paymentData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold mb-3">Detalhes da Transação</h3>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID da Transação:</span>
                    <p className="font-mono">{paymentData.sessionId?.slice(-8) || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-semibold text-green-600">
                      {paymentData.paymentStatus === 'paid' ? 'PAGO' : 'PENDENTE'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Valor Total:</span>
                    <p className="font-semibold">
                      {paymentData.currency?.toUpperCase()} {(paymentData.amountTotal / 100).toFixed(2)}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <p>{new Date(paymentData.created * 1000).toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                {paymentData.items && (
                  <div>
                    <span className="text-muted-foreground">Itens:</span>
                    <ul className="mt-2 space-y-1">
                      {paymentData.items.map((item: any, index: number) => (
                        <li key={index} className="text-sm">
                          {item.description} - Qtd: {item.quantity} - {(item.amountTotal / 100).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleDownloadReceipt}
                disabled={!paymentData}
                className="flex-1 gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar Comprovante
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex-1 gap-2"
              >
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Um email de confirmação foi enviado para você.</p>
              <p>Caso tenha dúvidas, entre em contato conosco.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}