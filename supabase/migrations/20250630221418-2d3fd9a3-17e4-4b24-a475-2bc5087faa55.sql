
-- Primeiro, vamos remover as políticas existentes se houver conflito
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Company admins can update company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;

-- Criar política mais permissiva para criação de empresas
CREATE POLICY "Users can create companies" ON public.companies
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Política para visualizar empresas (usuários podem ver empresas onde estão associados)
CREATE POLICY "Users can view their company" ON public.companies
  FOR SELECT 
  USING (
    id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid()
    ) OR creator_id = auth.uid()
  );

-- Política para atualizar empresas (somente admins ou criadores)
CREATE POLICY "Company admins can update company" ON public.companies
  FOR UPDATE 
  USING (
    creator_id = auth.uid() OR
    id IN (
      SELECT company_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Garantir que o campo creator_id seja preenchido automaticamente
CREATE OR REPLACE FUNCTION public.set_creator_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.creator_id IS NULL THEN
     NEW.creator_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para definir creator_id automaticamente
DROP TRIGGER IF EXISTS set_creator_id_trigger ON public.companies;
CREATE TRIGGER set_creator_id_trigger
  BEFORE INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_creator_id();
