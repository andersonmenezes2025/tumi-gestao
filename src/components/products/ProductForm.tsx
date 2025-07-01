
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/hooks/useCompany';
import { useProductForm } from '@/hooks/useProductForm';
import { ProductFormFields } from './ProductFormFields';
import { ProductStockFields } from './ProductStockFields';
import { ProductDetailsFields } from './ProductDetailsFields';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type ProductCategory = Tables<'product_categories'>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  categories: ProductCategory[];
  product?: Product | null;
}

export function ProductForm({ open, onOpenChange, onSubmit, categories, product }: ProductFormProps) {
  const { companyId } = useCompany();
  const { formData, setFormData, loading, handleSubmit, errors } = useProductForm({
    product,
    companyId,
    onSubmit,
    onOpenChange
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProductFormFields 
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            errors={errors}
          />

          <ProductStockFields 
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

          <ProductDetailsFields 
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
