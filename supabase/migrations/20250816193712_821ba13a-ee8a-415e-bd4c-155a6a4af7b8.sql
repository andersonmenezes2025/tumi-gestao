-- CRITICAL SECURITY FIX: Remove public data exposure policies
-- This fixes the major security vulnerability where sensitive business data was publicly accessible

-- Drop dangerous public access policies that expose sensitive data
DROP POLICY IF EXISTS "Public can view companies for public quotes" ON public.companies;
DROP POLICY IF EXISTS "Public can view active products for quotes" ON public.products;

-- Keep the token-based quote access policies as they require specific tokens
-- "Public can view quotes by token" and "Public can view quote items by token" are acceptable

-- Note: Public views (public_companies, public_products, public_quotes) don't need RLS 
-- as they are views and inherit security from underlying tables. They only expose safe, minimal data.

-- Add additional security: Ensure quote tokens are properly validated
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'quotes_public_token_format'
  ) THEN
    ALTER TABLE public.quotes 
    ADD CONSTRAINT quotes_public_token_format 
    CHECK (public_token IS NULL OR length(public_token) >= 8);
  END IF;
END $$;

-- Add index for better performance on token lookups  
CREATE INDEX IF NOT EXISTS idx_quotes_public_token 
ON public.quotes(public_token) 
WHERE public_token IS NOT NULL;

-- Add constraint to ensure shared quotes have reasonable expiration  
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'quotes_valid_until_reasonable'
  ) THEN
    ALTER TABLE public.quotes
    ADD CONSTRAINT quotes_valid_until_reasonable
    CHECK (valid_until IS NULL OR valid_until >= CURRENT_DATE - INTERVAL '1 year');
  END IF;
END $$;