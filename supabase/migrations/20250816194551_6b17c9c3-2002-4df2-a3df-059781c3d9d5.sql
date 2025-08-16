-- Fix security warnings: Add proper search_path to functions created in previous migration
-- This addresses the "Function Search Path Mutable" warnings

-- Update the get_public_quote_data function with proper search path
CREATE OR REPLACE FUNCTION public.get_public_quote_data(token_param text)
RETURNS TABLE (
  id uuid,
  company_id uuid,
  total_amount numeric,
  valid_until date,
  status text,
  notes text
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.company_id,
    q.total_amount,
    q.valid_until,
    q.status,
    q.notes
  FROM public.quotes q
  WHERE q.public_token = token_param 
  AND q.public_token IS NOT NULL 
  AND q.public_token <> ''
  AND (q.valid_until IS NULL OR q.valid_until >= CURRENT_DATE);
END;
$$;

-- Update the get_public_quote_items function with proper search path
CREATE OR REPLACE FUNCTION public.get_public_quote_items(token_param text)
RETURNS TABLE (
  id uuid,
  quote_id uuid,
  product_name text,
  quantity numeric
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qi.id,
    qi.quote_id,
    qi.product_name,
    qi.quantity
  FROM public.quote_items qi
  JOIN public.quotes q ON qi.quote_id = q.id
  WHERE q.public_token = token_param 
  AND q.public_token IS NOT NULL 
  AND q.public_token <> ''
  AND (q.valid_until IS NULL OR q.valid_until >= CURRENT_DATE);
END;
$$;