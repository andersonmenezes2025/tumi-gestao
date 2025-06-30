
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Eye, Edit, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';

export default function Vendas() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { hasCompany, company } = useCompany();

  // Dados mock para teste
  const mockSales = [
    {
      id: '1',
      saleNumber: 'VD000001',
      customerName: 'João Silva',
      totalAmount: 1250.00,
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      saleNumber: 'VD000002',
      customerName: 'Maria Santos',
      totalAmount: 850.00,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: '2024-01-16',
    },
  ];

  const handleNewSale = () => {
    toast({
      title: "Nova Venda",
      description: "Funcionalidade de nova venda será implementada em breve.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { label: 'Concluída', variant: 'default' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      cancelled: { label: 'Cancelada', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      paid: { label: 'Pago', variant: 'default' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      overdue: { label: 'Vencido', variant: 'destructive' as const },
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  if (!hasCompany) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas</CardTitle>
            <CardDescription>
              Você precisa estar associado a uma empresa para gerenciar vendas.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendas</h1>
          <p className="text-muted-foreground">
            Gerencie suas vendas e pedidos - {company?.name}
          </p>
        </div>
        <Button onClick={handleNewSale} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 2.100,00</div>
            <p className="text-xs text-muted-foreground">+20% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Vendas realizadas hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Vendas pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.050,00</div>
            <p className="text-xs text-muted-foreground">Valor médio por venda</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar vendas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Número</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Valor</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Pagamento</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockSales.map((sale) => {
                  const statusBadge = getStatusBadge(sale.status);
                  const paymentBadge = getPaymentStatusBadge(sale.paymentStatus);
                  
                  return (
                    <tr key={sale.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{sale.saleNumber}</td>
                      <td className="p-2">{sale.customerName}</td>
                      <td className="p-2">R$ {sale.totalAmount.toFixed(2).replace('.', ',')}</td>
                      <td className="p-2">
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>
                      </td>
                      <td className="p-2">{new Date(sale.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
