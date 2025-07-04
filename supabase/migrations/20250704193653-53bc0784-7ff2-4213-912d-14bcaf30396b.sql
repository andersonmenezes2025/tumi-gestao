-- Corrigir dados existentes e garantir integridade do sistema (versão corrigida)

-- 1. Criar profile para usuário existente se não existir
INSERT INTO public.profiles (id, email, full_name, company_id, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    c.id, -- Associar à empresa existente
    'admin', -- Como é o criador da empresa, deve ser admin
    now(),
    now()
FROM auth.users au
LEFT JOIN public.companies c ON c.creator_id = au.id
WHERE au.id NOT IN (SELECT id FROM public.profiles)
AND au.email IS NOT NULL;

-- 2. Garantir que a trigger de criação de profile existe e está ativa
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = now();
  RETURN new;
END;
$$;

-- 3. Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Limpar possíveis dados duplicados de empresas (usando ROW_NUMBER)
DELETE FROM public.companies 
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY creator_id, name ORDER BY created_at) as rn
        FROM public.companies
    ) t WHERE t.rn > 1
);

-- 5. Atualizar trigger para empresa para garantir creator_id
CREATE OR REPLACE FUNCTION public.set_creator_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.creator_id IS NULL THEN
     NEW.creator_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- 6. Aplicar trigger nas empresas
DROP TRIGGER IF EXISTS set_creator_id_trigger ON public.companies;
CREATE TRIGGER set_creator_id_trigger
  BEFORE INSERT ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_creator_id();

-- 7. Garantir que perfis de criadores de empresa sejam admins
UPDATE public.profiles 
SET role = 'admin', updated_at = now()
WHERE id IN (
    SELECT DISTINCT creator_id 
    FROM public.companies 
    WHERE creator_id IS NOT NULL
);

-- 8. Garantir integridade referencial - atualizar company_id nos profiles
UPDATE public.profiles 
SET company_id = c.id, updated_at = now()
FROM public.companies c
WHERE profiles.id = c.creator_id 
AND profiles.company_id IS NULL;