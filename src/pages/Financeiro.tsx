
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Financeiro() {
  const { companyId } = useCompany();

  const { data: accountsReceivable, isLoading: loadingReceivable } = useQuery({
    queryKey: ['accounts-receivable', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('accounts_receivable')
        .select('*, customers(name)')
        .eq('company_id', companyId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  const { data: accountsPayable, isLoading: loadingPayable } = useQuery({
    queryKey: ['accounts-payable', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .eq('company_id', companyId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  const totalReceivable = accountsReceivable?.reduce((sum, item) => 
    item.status === 'pending' ? sum + item.amount : sum, 0) || 0;
  
  const totalPayable = accountsPayable?.reduce((sum, item) => 
    item.status === 'pending' ? sum + item.amount : sum, 0) || 0;

  const balance = totalReceivable - totalPayable;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'paid': return 'Pago';
      case 'overdue': return 'Vencido';
      default: return status;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Receber
            </Button>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta a Pagar
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">A Receber</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">A Pagar</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {totalPayable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Vencimentos Hoje</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {[...(accountsReceivable || []), ...(accountsPayable || [])]
                      .filter(item => {
                        const today = new Date();
                        const dueDate = new Date(item.due_date);
                        return dueDate.toDateString() === today.toDateString() && item.status === 'pending';
                      }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abas de Contas */}
        <Tabs defaultValue="receivable" className="space-y-4">
          <TabsList>
            <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
            <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
          </TabsList>

          <TabsContent value="receivable">
            <Card>
              <CardHeader>
                <CardTitle>Contas a Receber</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReceivable ? (
                  <p>Carregando...</p>
                ) : accountsReceivable?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma conta a receber encontrada</p>
                ) : (
                  <div className="space-y-4">
                    {accountsReceivable?.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{account.description}</h3>
                          <p className="text-sm text-gray-600">
                            Cliente: {account.customers?.name || 'Não informado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Vencimento: {format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            R$ {account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge className={getStatusColor(account.status || 'pending')}>
                            {getStatusText(account.status || 'pending')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payable">
            <Card>
              <CardHeader>
                <CardTitle>Contas a Pagar</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPayable ? (
                  <p>Carregando...</p>
                ) : accountsPayable?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma conta a pagar encontrada</p>
                ) : (
                  <div className="space-y-4">
                    {accountsPayable?.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{account.description}</h3>
                          <p className="text-sm text-gray-600">
                            Fornecedor: {account.supplier_name || 'Não informado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Vencimento: {format(new Date(account.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                          {account.category && (
                            <p className="text-sm text-gray-600">
                              Categoria: {account.category}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            R$ {account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge className={getStatusColor(account.status || 'pending')}>
                            {getStatusText(account.status || 'pending')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
