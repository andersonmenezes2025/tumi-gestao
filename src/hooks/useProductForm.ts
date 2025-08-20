
import { useState, useEffect } from 'react';
import { Product } from '@/types/database';



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

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

const validateForm = (data: ProductFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (data.name.length > 100) {
    errors.name = 'Nome muito longo';
  }

  if (data.price < 0) {
    errors.price = 'Preço deve ser positivo';
  }

  if (data.cost_price < 0) {
    errors.cost_price = 'Preço de custo deve ser positivo';
  }

  if (data.stock_quantity < 0) {
    errors.stock_quantity = 'Estoque deve ser positivo';
  }

  if (data.min_stock < 0) {
    errors.min_stock = 'Estoque mínimo deve ser positivo';
  }

  if (data.max_stock !== null && data.max_stock < 0) {
    errors.max_stock = 'Estoque máximo deve ser positivo';
  }

  if (data.max_stock !== null && data.max_stock < data.min_stock) {
    errors.max_stock = 'Estoque máximo deve ser maior que o mínimo';
  }

  if (data.profit_margin_percentage < 0 || data.profit_margin_percentage > 100) {
    errors.profit_margin_percentage = 'Margem deve estar entre 0 e 100%';
  }

  return errors;
};

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar o formulário quando o produto for alterado
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        cost_price: product.cost_price || 0,
        stock_quantity: product.stock_quantity || 0,
        min_stock: product.min_stock || 0,
        max_stock: product.max_stock || null,
        category_id: product.category_id || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        unit: product.unit || 'un',
        active: product.active ?? true,
        image_url: product.image_url || null,
        profit_margin_percentage: product.profit_margin_percentage || 30
      });
    } else {
      resetForm();
    }
  }, [product]);

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
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!companyId) return;

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        description: formData.description ? sanitizeInput(formData.description) : null,
        price: formData.price,
        cost_price: formData.cost_price,
        stock_quantity: formData.stock_quantity,
        min_stock: formData.min_stock,
        max_stock: formData.max_stock,
        category_id: formData.category_id || null,
        sku: formData.sku ? sanitizeInput(formData.sku) : null,
        barcode: formData.barcode ? sanitizeInput(formData.barcode) : null,
        unit: formData.unit,
        active: formData.active,
        image_url: formData.image_url,
        profit_margin_percentage: formData.profit_margin_percentage,
        company_id: companyId,
      };

      await onSubmit(sanitizedData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    handleSubmit,
    errors
  };
}
