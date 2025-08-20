import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { useCompany } from '@/hooks/useCompany';
import { ProductPurchase } from '@/types/database';


interface ProductPurchasesListProps {
  refreshTrigger?: number;
}

export function ProductPurchasesList({ refreshTrigger }: ProductPurchasesListProps) {
  const [purchases, setPurchases] = useState<(ProductPurchase & { products?: { name: string; unit: string } })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { companyId } = useCompany();

  useEffect(() => {
    if (companyId) {
      fetchPurchases();
    }
  }, [companyId, refreshTrigger]);

  const fetchPurchases = async () => {
    if (!companyId) return;
    
    try {
      const response = await apiClient.get(`/data/product_purchases?company_id=${companyId}&order=created_at:desc`);
      setPurchases(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar compras",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePurchase = async (purchase: ProductPurchase) => {
    if (!window.confirm('Tem certeza que deseja excluir esta compra?')) return;

    try {
      await apiClient.delete(`/data/product_purchases/${purchase.id}`);

      toast({
        title: "Compra excluída com sucesso!",
      });

      fetchPurchases();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir compra",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
    (purchase.products?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (purchase.supplier_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar compras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
            <p className="text-xs text-muted-foreground">compras registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {purchases.reduce((total, p) => total + p.total_cost, 0).toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">valor total investido</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.filter(p => {
                const purchaseDate = new Date(p.purchase_date);
                const now = new Date();
                return purchaseDate.getMonth() === now.getMonth() && 
                       purchaseDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">compras este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchases List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Produto</th>
                  <th className="text-left py-3 px-4 font-medium">Fornecedor</th>
                  <th className="text-left py-3 px-4 font-medium">Quantidade</th>
                  <th className="text-left py-3 px-4 font-medium">Custo Unit.</th>
                  <th className="text-left py-3 px-4 font-medium">Total</th>
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{purchase.products?.name || 'Produto não encontrado'}</div>
                          <div className="text-sm text-gray-500">{purchase.notes}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {purchase.supplier_name || 'Não informado'}
                    </td>
                    <td className="py-3 px-4">
                      {purchase.quantity} {purchase.products?.unit || 'un'}
                    </td>
                    <td className="py-3 px-4">
                      R$ {purchase.unit_cost.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      R$ {purchase.total_cost.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(purchase.purchase_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePurchase(purchase)}
                          title="Excluir compra"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPurchases.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      Nenhuma compra encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}