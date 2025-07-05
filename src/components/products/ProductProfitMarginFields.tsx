import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface ProductFormData {
  price: number;
  cost_price: number;
  profit_margin_percentage: number;
}

interface ProductProfitMarginFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  errors: Record<string, string>;
}

export function ProductProfitMarginFields({ formData, setFormData, errors }: ProductProfitMarginFieldsProps) {
  // Calcular preço de venda baseado na margem e custo
  const calculateSellingPrice = () => {
    if (formData.cost_price > 0 && formData.profit_margin_percentage > 0) {
      const margin = formData.profit_margin_percentage / 100;
      const sellingPrice = formData.cost_price / (1 - margin);
      setFormData(prev => ({ ...prev, price: parseFloat(sellingPrice.toFixed(2)) }));
    }
  };

  // Calcular margem baseada no preço de venda e custo
  const calculateMargin = () => {
    if (formData.price > 0 && formData.cost_price > 0) {
      const margin = ((formData.price - formData.cost_price) / formData.price) * 100;
      setFormData(prev => ({ ...prev, profit_margin_percentage: parseFloat(margin.toFixed(2)) }));
    }
  };

  // Recalcular preço automaticamente quando custo ou margem mudam
  useEffect(() => {
    if (formData.cost_price > 0 && formData.profit_margin_percentage > 0) {
      const margin = formData.profit_margin_percentage / 100;
      const sellingPrice = formData.cost_price / (1 - margin);
      const roundedPrice = parseFloat(sellingPrice.toFixed(2));
      
      // Só atualiza se o preço calculado for diferente do atual
      if (Math.abs(formData.price - roundedPrice) > 0.01) {
        setFormData(prev => ({ ...prev, price: roundedPrice }));
      }
    }
  }, [formData.cost_price, formData.profit_margin_percentage]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost_price">Preço de Custo</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            value={formData.cost_price || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
          />
          {errors.cost_price && <p className="text-sm text-red-500">{errors.cost_price}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="profit_margin">Margem de Lucro (%)</Label>
          <div className="flex gap-2">
            <Input
              id="profit_margin"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.profit_margin_percentage || 0}
              onChange={(e) => setFormData(prev => ({ ...prev, profit_margin_percentage: parseFloat(e.target.value) || 0 }))}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={calculateMargin}
              title="Calcular margem baseada no preço"
            >
              <Calculator className="h-4 w-4" />
            </Button>
          </div>
          {errors.profit_margin_percentage && <p className="text-sm text-red-500">{errors.profit_margin_percentage}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço de Venda *</Label>
          <div className="flex gap-2">
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={calculateSellingPrice}
              title="Calcular preço baseado na margem"
            >
              <Calculator className="h-4 w-4" />
            </Button>
          </div>
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <Label>Lucro Estimado</Label>
          <div className="p-2 bg-gray-50 rounded border">
            R$ {formData.price > formData.cost_price ? (formData.price - formData.cost_price).toFixed(2).replace('.', ',') : '0,00'}
          </div>
        </div>
      </div>
    </>
  );
}