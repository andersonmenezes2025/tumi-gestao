
import { useState } from 'react';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number | null;
  category_id: string;
  sku: string;
  barcode: string;
  unit: string;
  active: boolean;
  image_url: string | null;
  profit_margin_percentage: number;
}

interface UseProductFormProps {
  product?: Product | null;
  companyId: string | undefined;
  onSubmit: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useProductForm({ product, companyId, onSubmit, onOpenChange }: UseProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    cost_price: product?.cost_price || 0,
    stock_quantity: product?.stock_quantity || 0,
    min_stock: product?.min_stock || 0,
    max_stock: product?.max_stock || null,
    category_id: product?.category_id || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    unit: product?.unit || 'un',
    active: product?.active ?? true,
    image_url: product?.image_url || null,
    profit_margin_percentage: product?.profit_margin_percentage || 30
  });

  const resetForm = (): void => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      cost_price: 0,
      stock_quantity: 0,
      min_stock: 0,
      max_stock: null,
      category_id: '',
      sku: '',
      barcode: '',
      unit: 'un',
      active: true,
      image_url: null,
      profit_margin_percentage: 30
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!companyId) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        company_id: companyId,
        category_id: formData.category_id || null
      });
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    handleSubmit
  };
}
