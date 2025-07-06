import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/hooks/useCompany';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

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
  const [supplierName, setSupplierName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  const { toast } = useToast();
  const { companyId } = useCompany();

  useEffect(() => {
    if (open && companyId) {
      fetchProducts();
    }
  }, [open, companyId]);

  const fetchProducts = async () => {
    if (!companyId) return;
    
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
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

      const { error } = await supabase
        .from('product_purchases')
        .insert([{
          company_id: companyId,
          product_id: selectedProduct,
          supplier_name: supplierName || null,
          quantity,
          unit_cost: unitCost,
          total_cost: totalCost,
          notes: notes || null
        }]);

      if (error) throw error;

      toast({
        title: "Compra registrada com sucesso!",
        description: "O estoque do produto foi atualizado automaticamente.",
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
    setSupplierName('');
    setNotes('');
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);
  const totalCost = quantity * unitCost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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

          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Nome do fornecedor"
            />
          </div>

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