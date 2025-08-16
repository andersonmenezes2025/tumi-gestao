-- Criar tabela para itens de orçamentos online
CREATE TABLE public.online_quote_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  online_quote_id UUID NOT NULL,
  product_id UUID,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo observações à tabela online_quotes
ALTER TABLE public.online_quotes 
ADD COLUMN observations TEXT;

-- Habilitar RLS
ALTER TABLE public.online_quote_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para online_quote_items
CREATE POLICY "Anyone can create online quote items" 
ON public.online_quote_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Company users can view their online quote items" 
ON public.online_quote_items 
FOR SELECT 
USING (online_quote_id IN (
  SELECT id FROM public.online_quotes 
  WHERE company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
));

CREATE POLICY "Company users can update their online quote items" 
ON public.online_quote_items 
FOR UPDATE 
USING (online_quote_id IN (
  SELECT id FROM public.online_quotes 
  WHERE company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
));

-- Função para atualizar updated_at automaticamente
CREATE TRIGGER update_online_quote_items_updated_at
  BEFORE UPDATE ON public.online_quote_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();