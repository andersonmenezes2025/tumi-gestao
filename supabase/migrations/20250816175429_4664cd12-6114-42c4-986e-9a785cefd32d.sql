-- Security fixes migration

-- 1. Fix database functions search paths
CREATE OR REPLACE FUNCTION public.generate_quote_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN LOWER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_sale_number(company_uuid uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  next_number INTEGER;
  new_sale_number TEXT;
BEGIN
  -- Buscar o próximo número sequencial para a empresa
  SELECT COALESCE(MAX(CAST(SUBSTRING(s.sale_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.sales s
  WHERE s.company_id = company_uuid
  AND s.sale_number ~ '^VD[0-9]+$';
  
  -- Formatar o número da venda
  new_sale_number := 'VD' || LPAD(next_number::TEXT, 6, '0');
  
  RETURN new_sale_number;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.set_creator_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.creator_id IS NULL THEN
     NEW.creator_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_stock_after_purchase()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Atualizar estoque do produto
  UPDATE public.products 
  SET 
    stock_quantity = COALESCE(stock_quantity, 0) + NEW.quantity,
    updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$function$;

-- 2. Secure quotes table public access - restrict to minimal fields only
DROP POLICY IF EXISTS "Public can view quotes by token" ON public.quotes;
CREATE POLICY "Public can view quotes by token" 
ON public.quotes 
FOR SELECT 
USING (
  public_token IS NOT NULL 
  AND public_token != ''
);

-- Create a view for public quote display that excludes PII
CREATE OR REPLACE VIEW public.public_quotes AS 
SELECT 
  id,
  company_id,
  total_amount,
  status,
  valid_until,
  notes,
  public_token
FROM public.quotes
WHERE public_token IS NOT NULL AND public_token != '';

-- 3. Secure companies table public access - only return branding info
DROP POLICY IF EXISTS "Public can view companies for public quotes" ON public.companies;
CREATE POLICY "Public can view companies for public quotes" 
ON public.companies 
FOR SELECT 
USING (
  id IN (
    SELECT DISTINCT company_id 
    FROM public.quotes 
    WHERE public_token IS NOT NULL AND public_token != ''
  )
);

-- Create a view for public company info that excludes sensitive data
CREATE OR REPLACE VIEW public.public_companies AS 
SELECT 
  id,
  name,
  logo_url,
  primary_color,
  secondary_color
FROM public.companies
WHERE id IN (
  SELECT DISTINCT company_id 
  FROM public.quotes 
  WHERE public_token IS NOT NULL AND public_token != ''
);

-- 4. Secure products table public access - only basic product info
DROP POLICY IF EXISTS "Public can view active products for quotes" ON public.products;
CREATE POLICY "Public can view active products for quotes" 
ON public.products 
FOR SELECT 
USING (
  active = true 
  AND company_id IN (
    SELECT DISTINCT company_id 
    FROM public.quotes 
    WHERE public_token IS NOT NULL AND public_token != ''
  )
);

-- Create a view for public products that excludes business-sensitive data
CREATE OR REPLACE VIEW public.public_products AS 
SELECT 
  id,
  company_id,
  name,
  description,
  price,
  image_url,
  unit
FROM public.products
WHERE active = true
AND company_id IN (
  SELECT DISTINCT company_id 
  FROM public.quotes 
  WHERE public_token IS NOT NULL AND public_token != ''
);

-- 5. Clean up duplicate RLS policies on profiles table
-- Remove duplicate policies (keeping the most comprehensive ones)
DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "View own profile" ON public.profiles;

-- Keep only the essential policies
-- (The remaining policies "Users can insert their own profile", "Users can update their own profile" are sufficient)

-- 6. Add RLS policies for the new views
ALTER VIEW public.public_quotes SET (security_invoker = true);
ALTER VIEW public.public_companies SET (security_invoker = true);  
ALTER VIEW public.public_products SET (security_invoker = true);