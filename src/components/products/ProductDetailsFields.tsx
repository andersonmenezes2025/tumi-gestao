
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductDetailsData {
  sku: string;
  barcode: string;
  image_url: string | null;
}

interface ProductDetailsFieldsProps {
  formData: ProductDetailsData;
  setFormData: React.Dispatch<React.SetStateAction<ProductDetailsData>>;
}

export function ProductDetailsFields({ formData, setFormData }: ProductDetailsFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            value={formData.sku || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input
            id="barcode"
            value={formData.barcode || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">URL da Imagem</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value || null }))}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>
    </>
  );
}
