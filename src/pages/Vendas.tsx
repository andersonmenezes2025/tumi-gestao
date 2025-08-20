
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Eye, Edit, Trash, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/hooks/useCompany';
import { SaleForm } from '@/components/sales/SaleForm';
import { apiClient } from '@/lib/api-client';
import { Sale, SaleItem, Product, Customer } from '@/types/database';

export default function Vendas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const { toast } = useToast();
  const { hasCompany, company, loading, companyId } = useCompany();

  console.log('Vendas - Has Company:', hasCompany, 'Company:', company);

  const fetchSales = async () => {
    if (!companyId) return;
    
    try {
      const response = await apiClient.get(`/data/sales?eq=company_id.${companyId}&order=created_at.desc`);
      setSales(response.data || []);
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
      const response = await apiClient.get(`/data/customers?eq=company_id.${companyId}&order=name`);
      setCustomers(response.data || []);
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

  const fetchSaleItems = async (saleId: string) => {
    setLoadingItems(true);
    try {
      const response = await apiClient.get(`/data/sale_items?eq=sale_id.${saleId}`);
      setSaleItems(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar itens da venda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingItems(false);
    }
  };

  const handleViewSale = async (sale: Sale) => {
    setViewingSale(sale);
    setShowViewDialog(true);
    await fetchSaleItems(sale.id);
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setShowSaleForm(true);
  };

  const handleDeleteSale = async (sale: Sale) => {
    if (window.confirm(`Tem certeza que deseja excluir a venda ${sale.sale_number}?`)) {
      try {
        const response = await apiClient.delete(`/data/sales/${sale.id}`);
        
        if (!response.error) {
          toast({
            title: "Venda excluída com sucesso!",
          });
          
          fetchSales();
        }
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
        onOpenChange={(open) => {
          setShowSaleForm(open);
          if (!open) setEditingSale(null);
        }}
        onSuccess={() => {
          fetchSales();
          setEditingSale(null);
        }}
        sale={editingSale}
      />

      {/* View Sale Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Detalhes da Venda #{viewingSale?.sale_number}
              <Button variant="ghost" size="sm" onClick={() => setShowViewDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {viewingSale && (
            <div className="space-y-6">
              {/* Informações da Venda */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{getCustomerName(viewingSale.customer_id)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge variant={getStatusBadge(viewingSale.status || 'pending').variant}>
                    {getStatusBadge(viewingSale.status || 'pending').label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Pagamento</Label>
                  <Badge variant={getPaymentStatusBadge(viewingSale.payment_status || 'pending').variant}>
                    {getPaymentStatusBadge(viewingSale.payment_status || 'pending').label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Data</Label>
                  <p className="font-medium">
                    {new Date(viewingSale.created_at || '').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {viewingSale.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                  <p className="p-3 bg-muted rounded-md">{viewingSale.notes}</p>
                </div>
              )}

              {/* Itens da Venda */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Itens da Venda</Label>
                {loadingItems ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-medium">Produto</th>
                          <th className="text-left p-3 font-medium">Quantidade</th>
                          <th className="text-left p-3 font-medium">Preço Unit.</th>
                          <th className="text-left p-3 font-medium">Desconto</th>
                          <th className="text-left p-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {saleItems.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="p-3">
                              {(item as any).products?.name || 'Produto não encontrado'}
                            </td>
                            <td className="p-3">
                              {item.quantity} {(item as any).products?.unit || 'un'}
                            </td>
                            <td className="p-3">
                              R$ {item.unit_price.toFixed(2).replace('.', ',')}
                            </td>
                            <td className="p-3">
                              {item.discount_percentage || 0}%
                            </td>
                            <td className="p-3 font-medium">
                              R$ {item.total_price.toFixed(2).replace('.', ',')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Totais */}
              <div className="border-t pt-4">
                <div className="flex justify-end space-y-2">
                  <div className="text-right space-y-1">
                    <div className="flex justify-between min-w-[200px]">
                      <span>Subtotal:</span>
                      <span>R$ {(viewingSale.total_amount - (viewingSale.tax_amount || 0)).toFixed(2).replace('.', ',')}</span>
                    </div>
                    {viewingSale.discount_amount && viewingSale.discount_amount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Desconto:</span>
                        <span>- R$ {viewingSale.discount_amount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    {viewingSale.tax_amount && viewingSale.tax_amount > 0 && (
                      <div className="flex justify-between">
                        <span>Impostos:</span>
                        <span>R$ {viewingSale.tax_amount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>R$ {viewingSale.total_amount.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => setShowViewDialog(false)}>
                  Fechar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowViewDialog(false);
                    handleEditSale(viewingSale);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Venda
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
