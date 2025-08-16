-- CRITICAL FIX: Completely remove public access to quotes table columns
-- RLS policies control row access, not column access, so customer PII was still exposed

-- Drop the policies that still allowed full column access to quotes table
DROP POLICY IF EXISTS "Public can view safe quote data by token" ON public.quotes;
DROP POLICY IF EXISTS "Public can view safe quote items by token" ON public.quote_items;

-- The secure database functions we created are the ONLY way to access public quote data
-- No direct table access should be allowed for public users

-- Verify our secure functions are properly configured (they already exclude customer PII)
-- get_public_quote_data returns: id, company_id, total_amount, valid_until, status, notes
-- get_public_quote_items returns: id, quote_id, product_name, quantity

-- Add a comment to document this security approach
COMMENT ON FUNCTION public.get_public_quote_data(text) IS 
'Secure function for public quote access. Only exposes business data, excludes customer PII (names, emails, phones). Use this instead of direct table access.';

COMMENT ON FUNCTION public.get_public_quote_items(text) IS 
'Secure function for public quote items access. Only exposes product names and quantities, excludes pricing details and product IDs.';

-- Ensure the existing authenticated user policies remain intact for internal use
-- The "Users can access their company data" policies on quotes and quote_items should still work for logged-in users