-- CRITICAL SECURITY FIX: Remove public data exposure policies
-- This fixes the major security vulnerability where sensitive business data was publicly accessible

-- Drop dangerous public access policies that expose sensitive data
DROP POLICY IF EXISTS "Public can view companies for public quotes" ON public.companies;
DROP POLICY IF EXISTS "Public can view active products for quotes" ON public.products;

-- Keep the token-based quote access but make it more restrictive
-- The existing "Public can view quotes by token" and "Public can view quote items by token" 
-- policies are acceptable as they require a specific token

-- Create secure RLS policies for public views
-- These views already exist and contain only safe, minimal data

-- Policy for public_companies view (already exists, just ensure RLS is enabled)
ALTER TABLE public.public_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public companies" 
ON public.public_companies 
FOR SELECT 
USING (true);

-- Policy for public_products view (already exists, just ensure RLS is enabled)  
ALTER TABLE public.public_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public products"
ON public.public_products
FOR SELECT 
USING (true);

-- Policy for public_quotes view (already exists, just ensure RLS is enabled)
ALTER TABLE public.public_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public quotes"
ON public.public_quotes
FOR SELECT 
USING (true);

-- Add additional security: Ensure quote tokens are properly validated
-- Update the quotes table to have better token validation
ALTER TABLE public.quotes 
ADD CONSTRAINT quotes_public_token_format 
CHECK (public_token IS NULL OR length(public_token) >= 8);

-- Add index for better performance on token lookups
CREATE INDEX IF NOT EXISTS idx_quotes_public_token 
ON public.quotes(public_token) 
WHERE public_token IS NOT NULL;