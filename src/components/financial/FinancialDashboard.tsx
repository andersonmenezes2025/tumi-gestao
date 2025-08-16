import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFinancial } from '@/hooks/useFinancial';
import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialDashboardProps {
  onNewReceivable?: () => void;
  onNewPayable?: () => void;
}

export function FinancialDashboard({ onNewReceivable, onNewPayable }: FinancialDashboardProps) {
  const { summary, receivables, payables, loading, markReceivableAsPaid, markPayableAsPaid } = useFinancial();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Pago</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-orange-300 text-orange-800">Pendente</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Vencido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendente: {formatCurrency(summary.pendingReceivables)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pendente: {formatCurrency(summary.pendingPayables)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.balance)}
            </div>
            <p className="text-xs text-muted-foreground">Saldo atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-600" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.pendingReceivables + summary.pendingPayables)}
            </div>
            <p className="text-xs text-muted-foreground">A receber/pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={onNewReceivable} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
        <Button variant="outline" onClick={onNewPayable} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts Receivable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Contas a Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receivables.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma conta a receber encontrada
                </p>
              ) : (
                receivables.slice(0, 5).map((receivable) => (
                  <div key={receivable.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{receivable.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(receivable.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(receivable.amount)}</p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(
                          isOverdue(receivable.due_date, receivable.status) ? 'overdue' : receivable.status
                        )}
                        {receivable.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markReceivableAsPaid(receivable.id)}
                            className="ml-2"
                          >
                            Marcar como Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Accounts Payable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
              Contas a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payables.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma conta a pagar encontrada
                </p>
              ) : (
                payables.slice(0, 5).map((payable) => (
                  <div key={payable.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{payable.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(payable.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                        {payable.supplier_name && (
                          <span>• {payable.supplier_name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(payable.amount)}</p>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(
                          isOverdue(payable.due_date, payable.status) ? 'overdue' : payable.status
                        )}
                        {payable.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markPayableAsPaid(payable.id)}
                            className="ml-2"
                          >
                            Marcar como Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}