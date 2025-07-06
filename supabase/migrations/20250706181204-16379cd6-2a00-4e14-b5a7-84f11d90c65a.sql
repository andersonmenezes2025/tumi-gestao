-- Criar tabela para unidades de medida personalizadas
CREATE TABLE public.product_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT product_units_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
  CONSTRAINT product_units_name_company_unique 
    UNIQUE (name, company_id),
  CONSTRAINT product_units_abbreviation_company_unique 
    UNIQUE (abbreviation, company_id)
);

-- Habilitar RLS
ALTER TABLE public.product_units ENABLE ROW LEVEL SECURITY;

-- Política para usuários acessarem dados da sua empresa
CREATE POLICY "Users can access their company units" 
ON public.product_units 
FOR ALL 
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_product_units_updated_at
BEFORE UPDATE ON public.product_units
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir unidades padrão para todas as empresas existentes
INSERT INTO public.product_units (company_id, name, abbreviation, description)
SELECT 
  c.id,
  unit_data.name,
  unit_data.abbreviation,
  unit_data.description
FROM companies c
CROSS JOIN (
  VALUES 
    ('Unidade', 'un', 'Unidade individual'),
    ('Quilograma', 'kg', 'Quilograma'),
    ('Grama', 'g', 'Grama'),
    ('Litro', 'l', 'Litro'),
    ('Mililitro', 'ml', 'Mililitro'),
    ('Metro', 'm', 'Metro'),
    ('Centímetro', 'cm', 'Centímetro'),
    ('Milímetro', 'mm', 'Milímetro'),
    ('Metro Quadrado', 'm²', 'Metro quadrado'),
    ('Metro Cúbico', 'm³', 'Metro cúbico'),
    ('Caixa', 'cx', 'Caixa'),
    ('Pacote', 'pct', 'Pacote'),
    ('Dúzia', 'dz', 'Dúzia'),
    ('Par', 'par', 'Par'),
    ('Kit', 'kit', 'Kit'),
    ('Saco', 'sc', 'Saco'),
    ('Bandeja', 'bd', 'Bandeja'),
    ('Galão', 'gl', 'Galão')
) AS unit_data(name, abbreviation, description);

-- Criar tabela para histórico de compras de produtos
CREATE TABLE public.product_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  product_id UUID NOT NULL,
  supplier_name TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT product_purchases_company_id_fkey 
    FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
  CONSTRAINT product_purchases_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT product_purchases_quantity_positive 
    CHECK (quantity > 0),
  CONSTRAINT product_purchases_unit_cost_positive 
    CHECK (unit_cost >= 0),
  CONSTRAINT product_purchases_total_cost_positive 
    CHECK (total_cost >= 0)
);

-- Habilitar RLS
ALTER TABLE public.product_purchases ENABLE ROW LEVEL SECURITY;

-- Política para usuários acessarem dados da sua empresa
CREATE POLICY "Users can access their company purchases" 
ON public.product_purchases 
FOR ALL 
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_product_purchases_updated_at
BEFORE UPDATE ON public.product_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar estoque após compra
CREATE OR REPLACE FUNCTION public.update_stock_after_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estoque do produto
  UPDATE public.products 
  SET 
    stock_quantity = COALESCE(stock_quantity, 0) + NEW.quantity,
    updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estoque automaticamente após compra
CREATE TRIGGER update_stock_after_purchase_trigger
AFTER INSERT ON public.product_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_stock_after_purchase();