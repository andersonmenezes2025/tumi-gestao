import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { useParams } from 'react-router-dom';
import { Building2, Mail, Phone, CheckCircle, Calendar, FileText } from 'lucide-react';

export default function SharedQuote() {
  const { token } = useParams();
  const [quote, setQuote] = useState<any>(null);
  const [quoteItems, setQuoteItems] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchQuoteByToken();
    }
  }, [token]);

  const fetchQuoteByToken = async () => {
    if (!token) {
      console.log('SharedQuote: token não fornecido');
      return;
    }
    
    console.log('SharedQuote: Buscando orçamento com token:', token);
    
    try {
      // Fetch secure quote data using token
      const quoteData = await apiClient.get(`/quotes/public/${token}`);

      console.log('SharedQuote: Resultado da busca do orçamento:', { quoteData });

      if (!quoteData) {
        console.error('SharedQuote: Orçamento não encontrado para token:', token);
        throw new Error('Orçamento não encontrado ou expirado');
      }
      
      console.log('SharedQuote: Orçamento encontrado:', quoteData);
      setQuote(quoteData);

      // Fetch company data
      const companyData = await apiClient.get(`/companies/public/${quoteData.company_id}`);
      
      setCompany(companyData);

      // Fetch quote items
      const itemsData = await apiClient.get(`/quotes/${token}/items/public`);

      console.log('SharedQuote: Itens encontrados:', itemsData);
      setQuoteItems(itemsData || []);
    } catch (error: any) {
      console.error('SharedQuote: Erro na fetchQuoteByToken:', error);
      toast({
        title: "Erro ao carregar orçamento",
        description: `Orçamento não encontrado. Token: ${token}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quote || !company) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Orçamento não encontrado</h2>
            <p className="text-gray-600">O orçamento solicitado não foi encontrado ou expirou.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Aprovado', class: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitado', class: 'bg-red-100 text-red-800' },
      sent: { label: 'Enviado', class: 'bg-blue-100 text-blue-800' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Company Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              {company.logo_url && (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="h-16 w-auto mx-auto"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-xl text-gray-600 mt-2">Orçamento</p>
              </div>
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                {company.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {company.email}
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {company.phone}
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {company.website}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Details */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Orçamento</CardTitle>
                <p className="text-muted-foreground mt-1">Proposta Comercial</p>
              </div>
              <div className="text-right">
                {getStatusBadge(quote.status || 'pending')}
                <p className="text-sm text-muted-foreground mt-2">
                  Criado em {new Date(quote.created_at).toLocaleDateString('pt-BR')}
                </p>
                {quote.valid_until && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    Válido até {new Date(quote.valid_until).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div>
                <h3 className="font-semibold mb-2">Informações da Empresa</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Empresa:</strong> {company.name}</p>
                </div>
              </div>
            </div>

            {/* Quote Items */}
            {quoteItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Itens do Orçamento
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Item</th>
                        <th className="border border-gray-200 px-4 py-2 text-right">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteItems.map((item) => (
                        <tr key={item.id}>
                          <td className="border border-gray-200 px-4 py-2">{item.product_name}</td>
                          <td className="border border-gray-200 px-4 py-2 text-right">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-semibold">
                        <td className="border border-gray-200 px-4 py-2 text-right">Total Geral:</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">
                          R$ {quote.total_amount.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            {quote.notes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Observações</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const subject = `Aprovação do orçamento - ${company.name}`;
                  const body = `Olá,\n\nGostaria de aprovar o orçamento enviado.\n\nAtenciosamente`;
                  window.open(`mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Aprovar Orçamento
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const subject = `Dúvidas sobre orçamento - ${company.name}`;
                  const body = `Olá,\n\nTenho algumas dúvidas sobre o orçamento enviado.\n\nAtenciosamente`;
                  window.open(`mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
              >
                <Mail className="h-5 w-5 mr-2" />
                Entrar em Contato
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by GestãoPro - Sistema de Gestão Comercial</p>
        </div>
      </div>
    </div>
  );
}