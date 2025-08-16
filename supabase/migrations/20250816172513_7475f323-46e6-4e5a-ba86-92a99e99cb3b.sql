-- Criar política para permitir acesso público aos produtos ativos para orçamentos online
CREATE POLICY "Public can view active products for quotes" 
ON public.products 
FOR SELECT 
TO anon
USING (active = true);