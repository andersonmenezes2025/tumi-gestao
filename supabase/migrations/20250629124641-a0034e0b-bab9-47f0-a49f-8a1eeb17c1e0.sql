
-- Habilitar RLS nas tabelas que não têm (somente se não estiver habilitado)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'companies' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Criar políticas RLS para companies (somente se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Users can create companies'
    ) THEN
        CREATE POLICY "Users can create companies" ON public.companies
          FOR INSERT WITH CHECK (creator_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Company admins can update company'
    ) THEN
        CREATE POLICY "Company admins can update company" ON public.companies
          FOR UPDATE USING (
            id IN (
              SELECT company_id FROM public.profiles 
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
    END IF;
END $$;

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adicionar campo creator_id nas empresas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'creator_id'
    ) THEN
        ALTER TABLE public.companies 
        ADD COLUMN creator_id uuid REFERENCES auth.users(id);
    END IF;
END $$;
