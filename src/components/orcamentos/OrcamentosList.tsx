import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Edit, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Quote = Tables<'quotes'>;

interface OrcamentosListProps {
  quotes: Quote[];
  onEdit: (quote: Quote) => void;
  onDelete: (quote: Quote) => void;
  onShare: (quote: Quote) => void;
}

export function OrcamentosList({ quotes, onEdit, onDelete, onShare }: OrcamentosListProps) {
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

  return (
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
              {quotes.map((quote) => (
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
                        onClick={() => onShare(quote)}
                        title="Compartilhar orçamento"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(quote)}
                        title="Editar orçamento"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(quote)}
                        title="Excluir orçamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
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
  );
}