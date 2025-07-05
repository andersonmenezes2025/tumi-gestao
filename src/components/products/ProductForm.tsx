
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompany } from '@/hooks/useCompany';
import { useProductForm } from '@/hooks/useProductForm';
import { ProductFormFields } from './ProductFormFields';
import { ProductStockFields } from './ProductStockFields';
import { ProductDetailsFields } from './ProductDetailsFields';
import { ProductProfitMarginFields } from './ProductProfitMarginFields';
import { ProductSKUField } from './ProductSKUField';
import { ProductImageUpload } from './ProductImageUpload';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="pricing">Preços</TabsTrigger>
              <TabsTrigger value="stock">Estoque</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <ProductFormFields 
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                errors={errors}
              />

              <ProductSKUField 
                formData={formData}
                setFormData={setFormData}
              />

              <ProductImageUpload 
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <ProductProfitMarginFields 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="stock" className="space-y-4">
              <ProductStockFields 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <ProductDetailsFields 
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
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
