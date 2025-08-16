import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Customer = Tables<'customers'>;

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateSaleData = (
  saleItems: any[],
  paymentMethod: string,
  customerType: string,
  selectedCustomer: string,
  newCustomer: any
): ValidationResult => {
  const errors: string[] = [];

  // Validar itens da venda
  if (saleItems.length === 0) {
    errors.push('Adicione pelo menos um produto à venda');
  }

  // Validar se os itens são válidos
  const invalidItems = saleItems.filter(item => 
    !item.product_id || 
    !item.product_name || 
    item.quantity <= 0 || 
    item.unit_price < 0
  );

  if (invalidItems.length > 0) {
    errors.push('Todos os itens devem ter produto, quantidade maior que 0 e preço válido');
  }

  // Validar método de pagamento
  if (!paymentMethod) {
    errors.push('Selecione um método de pagamento');
  }

  // Validar cliente
  if (customerType === 'existing' && !selectedCustomer) {
    errors.push('Selecione um cliente existente');
  }

  if (customerType === 'new' && !newCustomer.name?.trim()) {
    errors.push('Nome do cliente é obrigatório');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateQuoteData = (
  formData: any,
  items: any[],
  customerType: string,
  selectedCustomerId: string
): ValidationResult => {
  const errors: string[] = [];

  // Validar dados do cliente
  if (!formData.customer_name?.trim()) {
    errors.push('Nome do cliente é obrigatório');
  }

  if (!formData.customer_email?.trim()) {
    errors.push('Email do cliente é obrigatório');
  }

  // Validar formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.customer_email && !emailRegex.test(formData.customer_email)) {
    errors.push('Email inválido');
  }

  // Validar cliente existente selecionado
  if (customerType === 'existing' && !selectedCustomerId) {
    errors.push('Selecione um cliente existente');
  }

  // Validar itens do orçamento
  const validItems = items.filter(item => 
    item.product_name && item.quantity > 0 && item.unit_price >= 0
  );

  if (validItems.length === 0) {
    errors.push('Adicione pelo menos um item válido ao orçamento');
  }

  // Validar se há produtos sem nome
  const invalidItems = items.filter(item => 
    item.quantity > 0 && (!item.product_name || item.unit_price < 0)
  );

  if (invalidItems.length > 0) {
    errors.push('Todos os itens devem ter produto selecionado e preço válido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar estoque antes da venda
export const validateStock = async (
  saleItems: any[],
  products: Product[]
): Promise<ValidationResult> => {
  const errors: string[] = [];

  for (const item of saleItems) {
    const product = products.find(p => p.id === item.product_id);
    if (product && product.stock_quantity !== null) {
      if (product.stock_quantity < item.quantity) {
        errors.push(`${product.name}: Estoque insuficiente. Disponível: ${product.stock_quantity}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Verificar se a empresa existe e está ativa
export const validateCompany = async (companyId: string): Promise<ValidationResult> => {
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .single();

    if (error || !company) {
      return {
        isValid: false,
        errors: ['Empresa não encontrada']
      };
    }

    return {
      isValid: true,
      errors: []
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Erro ao validar empresa']
    };
  }
};