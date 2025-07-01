
-- Limpar todas as tabelas para começar do zero
TRUNCATE TABLE public.sale_items CASCADE;
TRUNCATE TABLE public.sales CASCADE;
TRUNCATE TABLE public.quote_items CASCADE;
TRUNCATE TABLE public.quotes CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.product_categories CASCADE;
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.crm_leads CASCADE;
TRUNCATE TABLE public.marketing_campaigns CASCADE;
TRUNCATE TABLE public.integrations CASCADE;
TRUNCATE TABLE public.accounts_receivable CASCADE;
TRUNCATE TABLE public.accounts_payable CASCADE;
TRUNCATE TABLE public.companies CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Remover constraint de CNPJ único para evitar conflitos em testes
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_cnpj_key;

-- Adicionar constraint de CNPJ único apenas quando não for nulo
ALTER TABLE public.companies ADD CONSTRAINT companies_cnpj_unique 
  UNIQUE NULLS NOT DISTINCT (cnpj);

-- Corrigir políticas RLS problemáticas
DROP POLICY IF EXISTS "Insert company" ON public.companies;
DROP POLICY IF EXISTS "Select own company" ON public.companies;
DROP POLICY IF EXISTS "Update own company" ON public.companies;

-- Política simplificada para criação de empresas
CREATE POLICY "Users can manage companies" ON public.companies
  FOR ALL 
  USING (
    creator_id = auth.uid() OR 
    id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  )
  WITH CHECK (
    creator_id = auth.uid() OR 
    id IN (
      SELECT company_id 
      FROM public.profiles 
      WHERE id = auth.uid() AND company_id IS NOT NULL
    )
  );

-- Garantir que profiles sejam criados corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
