
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Eye, Edit, Trash, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { SaleForm } from '@/components/sales/SaleForm';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Sale = Tables<'sales'>;
type Customer = Tables<'customers'>;

export default function Vendas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const { toast } = useToast();
  const { hasCompany, company, loading, companyId } = useCompany();

  console.log('Vendas - Has Company:', hasCompany, 'Company:', company);

  const fetchSales = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          customers (
            name
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar vendas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingSales(false);
    }
  };

  const fetchCustomers = async () => {
    if (!companyId) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  React.useEffect(() => {
    if (companyId) {
      fetchSales();
      fetchCustomers();
    }
  }, [companyId]);

  const handleNewSale = () => {
    setShowSaleForm(true);
  };

  const handleViewSale = (sale: Sale) => {
    toast({
      title: "Visualizar Venda",
      description: `Visualizando venda ${sale.sale_number}`,
    });
  };

  const handleEditSale = (sale: Sale) => {
    toast({
      title: "Editar Venda",
      description: `Editando venda ${sale.sale_number}`,
    });
  };

  const handleDeleteSale = async (sale: Sale) => {
    if (window.confirm(`Tem certeza que deseja excluir a venda ${sale.sale_number}?`)) {
      try {
        const { error } = await supabase
          .from('sales')
          .delete()
          .eq('id', sale.id);

        if (error) throw error;

        toast({
          title: "Venda excluída com sucesso!",
        });
        
        fetchSales();
      } catch (error: any) {
        toast({
          title: "Erro ao excluir venda",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return 'Cliente não informado';
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Cliente não encontrado';
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

  if (loading || loadingSales) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Vá para o Dashboard para criar ou entrar em uma empresa.
            </p>
          </CardContent>
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
            Gerencie suas vendas e pedidos - {company?.name || 'Sua Empresa'}
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
            <div className="text-2xl font-bold">
              R$ {sales.reduce((total, sale) => total + sale.total_amount, 0).toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">Total de vendas realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-muted-foreground">Total de vendas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Vendas pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {sales.length > 0 ? (sales.reduce((total, sale) => total + sale.total_amount, 0) / sales.length).toFixed(2).replace('.', ',') : '0,00'}
            </div>
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
                {sales.map((sale) => {
                  const statusBadge = getStatusBadge(sale.status || 'pending');
                  const paymentBadge = getPaymentStatusBadge(sale.payment_status || 'pending');
                  
                  return (
                    <tr key={sale.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{sale.sale_number}</td>
                      <td className="p-2">{getCustomerName(sale.customer_id)}</td>
                      <td className="p-2">R$ {sale.total_amount.toFixed(2).replace('.', ',')}</td>
                      <td className="p-2">
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>
                      </td>
                      <td className="p-2">{new Date(sale.created_at || '').toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleViewSale(sale)}
                            title="Visualizar venda"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditSale(sale)}
                            title="Editar venda"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteSale(sale)}
                            title="Excluir venda"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Nenhuma venda encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sale Form Dialog */}
      <SaleForm
        open={showSaleForm}
        onOpenChange={setShowSaleForm}
        onSuccess={fetchSales}
      />
    </div>
  );
}
