
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tables } from '@/integrations/supabase/types';

type ProductCategory = Tables<'product_categories'>;

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cost_price: number;
  category_id: string;
  unit: string;
}

interface ProductFormFieldsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: ProductCategory[];
  errors: Record<string, string>;
}

export function ProductFormFields({ formData, setFormData, categories, errors }: ProductFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço de Venda *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            required
          />
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </div>
        
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unidade</Label>
        <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="un">Unidade</SelectItem>
            <SelectItem value="kg">Quilograma</SelectItem>
            <SelectItem value="g">Grama</SelectItem>
            <SelectItem value="l">Litro</SelectItem>
            <SelectItem value="ml">Mililitro</SelectItem>
            <SelectItem value="m">Metro</SelectItem>
            <SelectItem value="cm">Centímetro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
