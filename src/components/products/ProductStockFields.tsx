
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductStockData {
  stock_quantity: number;
  min_stock: number;
  max_stock: number | null;
}

interface ProductStockFieldsProps {
  formData: ProductStockData;
  setFormData: React.Dispatch<React.SetStateAction<ProductStockData>>;
}

export function ProductStockFields({ formData, setFormData }: ProductStockFieldsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="stock_quantity">Estoque Atual</Label>
        <Input
          id="stock_quantity"
          type="number"
          value={formData.stock_quantity || 0}
          onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="min_stock">Estoque Mínimo</Label>
        <Input
          id="min_stock"
          type="number"
          value={formData.min_stock || 0}
          onChange={(e) => setFormData(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="max_stock">Estoque Máximo</Label>
        <Input
          id="max_stock"
          type="number"
          value={formData.max_stock || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, max_stock: e.target.value ? parseInt(e.target.value) : null }))}
        />
      </div>
    </div>
  );
}
