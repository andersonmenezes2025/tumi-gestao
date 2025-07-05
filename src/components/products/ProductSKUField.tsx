import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';

interface ProductFormData {
  sku: string;
  name: string;
}

interface ProductSKUFieldProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
}

export function ProductSKUField({ formData, setFormData }: ProductSKUFieldProps) {
  const generateSKU = () => {
    // Gerar SKU baseado no nome do produto e timestamp
    const namePrefix = formData.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 3);
    
    const timestamp = Date.now().toString().slice(-4);
    const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    
    const generatedSKU = `${namePrefix || 'PRD'}${timestamp}${randomSuffix}`;
    
    setFormData(prev => ({ ...prev, sku: generatedSKU }));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="sku">SKU (Código do Produto)</Label>
      <div className="flex gap-2">
        <Input
          id="sku"
          value={formData.sku}
          onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
          placeholder="Código único do produto"
        />
        <Button
          type="button"
          variant="outline"
          onClick={generateSKU}
          title="Gerar SKU automaticamente"
        >
          <Shuffle className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500">
        SKU é um código único para identificar o produto
      </p>
    </div>
  );
}