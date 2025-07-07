-- Fix the generate_sale_number function to resolve variable naming conflict
CREATE OR REPLACE FUNCTION public.generate_sale_number(company_uuid uuid)
RETURNS text
LANGUAGE plpgsql
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