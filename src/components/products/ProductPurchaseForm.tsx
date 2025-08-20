import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { useCompany } from '@/hooks/useCompany';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Product, Supplier, ProductPurchase } from '@/types/database';


interface ProductPurchaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProductPurchaseForm({ open, onOpenChange, onSuccess }: ProductPurchaseFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [supplierType, setSupplierType] = useState<'existing' | 'new'>('existing');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [newSupplierName, setNewSupplierName] = useState<string>('');
  const [profitMarginType, setProfitMarginType] = useState<'percentage' | 'fixed'>('percentage');
  const [profitMarginValue, setProfitMarginValue] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const { toast } = useToast();
  const { companyId } = useCompany();
  const { suppliers } = useSuppliers();

  useEffect(() => {
    if (open && companyId) {
      fetchProducts();
    }
  }, [open, companyId]);

  const fetchProducts = async () => {
    if (!companyId) return;
    
    setLoadingProducts(true);
    try {
      const response = await apiClient.get(`/data/products?company_id=${companyId}&active=true&order=name:asc`);
      setProducts(response.data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedProduct) return;

    setLoading(true);
    try {
      const totalCost = quantity * unitCost;
      const supplierName = supplierType === 'existing' ? 
        suppliers.find(s => s.id === selectedSupplierId)?.name || null :
        newSupplierName || null;

      // Calculate new selling price based on profit margin
      let newSellingPrice = unitCost;
      if (profitMarginType === 'percentage') {
        newSellingPrice = unitCost * (1 + profitMarginValue / 100);
      } else {
        newSellingPrice = unitCost + profitMarginValue;
      }

      await apiClient.post('/data/product_purchases', {
        company_id: companyId,
        product_id: selectedProduct,
        supplier_id: supplierType === 'existing' ? selectedSupplierId || null : null,
        supplier_name: supplierName,
        quantity,
        unit_cost: unitCost,
        total_cost: totalCost,
        notes: notes || null
      });

      // Update product cost price and selling price
      await apiClient.put(`/data/products/${selectedProduct}`, {
        cost_price: unitCost,
        price: newSellingPrice,
        profit_margin_percentage: profitMarginType === 'percentage' ? profitMarginValue : null
      });

      // Create accounts payable for the purchase
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days default

      const payableSupplierName = supplierType === 'existing' && selectedSupplierId 
        ? suppliers.find(s => s.id === selectedSupplierId)?.name 
        : newSupplierName || 'Fornecedor não informado';

      const selectedProductData = products.find(p => p.id === selectedProduct);
      const productName = selectedProductData?.name || 'Produto';
      const productUnit = selectedProductData?.unit || 'un';

      try {
        await apiClient.post('/data/accounts_payable', {
          company_id: companyId,
          amount: totalCost,
          due_date: dueDate.toISOString().split('T')[0],
          description: `Compra de ${productName} - ${quantity} ${productUnit}`,
          supplier_name: payableSupplierName,
          category: 'inventory',
          status: 'pending'
        });
      } catch (payableError) {
        console.warn('Erro ao criar conta a pagar:', payableError);
        // Don't throw here, as the purchase was successful
      }

      toast({
        title: "Compra registrada com sucesso!",
        description: "O estoque, preços e conta a pagar foram criados automaticamente.",
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar compra",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProduct('');
    setQuantity(1);
    setUnitCost(0);
    setSupplierType('existing');
    setSelectedSupplierId('');
    setNewSupplierName('');
    setProfitMarginType('percentage');
    setProfitMarginValue(30);
    setNotes('');
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const totalCost = quantity * unitCost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Compra de Produto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Produto *</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={loadingProducts}>
              <SelectTrigger>
                <SelectValue placeholder={loadingProducts ? "Carregando..." : "Selecione um produto"} />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - Estoque atual: {product.stock_quantity || 0} {product.unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProductData && (
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm space-y-1">
                <p><strong>Produto:</strong> {selectedProductData.name}</p>
                <p><strong>Estoque atual:</strong> {selectedProductData.stock_quantity || 0} {selectedProductData.unit}</p>
                <p><strong>Preço de venda:</strong> R$ {selectedProductData.price.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitCost">Custo Unitário *</Label>
              <Input
                id="unitCost"
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Supplier Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={supplierType} 
                onValueChange={(value: 'existing' | 'new') => setSupplierType(value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing-supplier" />
                  <Label htmlFor="existing-supplier">Fornecedor Existente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new-supplier" />
                  <Label htmlFor="new-supplier">Novo Fornecedor</Label>
                </div>
              </RadioGroup>

              {supplierType === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="supplier-select">Selecionar Fornecedor</Label>
                  <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="new-supplier-name">Nome do Novo Fornecedor</Label>
                  <Input
                    id="new-supplier-name"
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="Nome do fornecedor"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profit Margin */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Margem de Lucro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={profitMarginType} 
                onValueChange={(value: 'percentage' | 'fixed') => setProfitMarginType(value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="margin-percentage" />
                  <Label htmlFor="margin-percentage">Percentual (%)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="margin-fixed" />
                  <Label htmlFor="margin-fixed">Valor Fixo (R$)</Label>
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor="profit-margin">
                  {profitMarginType === 'percentage' ? 'Margem de Lucro (%)' : 'Valor da Margem (R$)'}
                </Label>
                <Input
                  id="profit-margin"
                  type="number"
                  min="0"
                  step={profitMarginType === 'percentage' ? '0.1' : '0.01'}
                  value={profitMarginValue}
                  onChange={(e) => setProfitMarginValue(parseFloat(e.target.value) || 0)}
                />
              </div>

              {unitCost > 0 && profitMarginValue > 0 && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm space-y-1">
                    <p><strong>Cálculo do Preço de Venda:</strong></p>
                    <p>Custo: R$ {unitCost.toFixed(2).replace('.', ',')}</p>
                    <p>Margem: {profitMarginType === 'percentage' ? `${profitMarginValue}%` : `R$ ${profitMarginValue.toFixed(2).replace('.', ',')}`}</p>
                    <p><strong>Novo Preço de Venda: R$ {
                      profitMarginType === 'percentage' 
                        ? (unitCost * (1 + profitMarginValue / 100)).toFixed(2).replace('.', ',')
                        : (unitCost + profitMarginValue).toFixed(2).replace('.', ',')
                    }</strong></p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a compra..."
            />
          </div>

          {quantity > 0 && unitCost > 0 && (
            <div className="p-3 bg-primary/10 rounded-md">
              <div className="text-sm space-y-1">
                <p><strong>Resumo da Compra:</strong></p>
                <p>Quantidade: {quantity} {selectedProductData?.unit || 'unidades'}</p>
                <p>Custo unitário: R$ {unitCost.toFixed(2).replace('.', ',')}</p>
                <p><strong>Total: R$ {totalCost.toFixed(2).replace('.', ',')}</strong></p>
                {selectedProductData && (
                  <p>Novo estoque: {(selectedProductData.stock_quantity || 0) + quantity} {selectedProductData.unit}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedProduct || quantity <= 0 || unitCost < 0}
            >
              {loading ? 'Registrando...' : 'Registrar Compra'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}