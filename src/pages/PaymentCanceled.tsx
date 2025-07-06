import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RotateCcw } from 'lucide-react';

export default function PaymentCanceled() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">
              Pagamento Cancelado
            </CardTitle>
            <CardDescription>
              A transação foi cancelada e nenhum valor foi cobrado
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">O que aconteceu?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Você escolheu cancelar o pagamento</li>
                <li>• Nenhum valor foi debitado do seu cartão</li>
                <li>• Você pode tentar novamente a qualquer momento</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => window.history.back()}
                className="flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Tentar Novamente
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
              <p>Caso tenha dúvidas sobre o processo de pagamento,</p>
              <p>entre em contato com nosso suporte.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}