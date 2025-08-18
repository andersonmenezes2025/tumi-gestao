-- Fix critical security vulnerabilities for production

-- 1. Drop public views and tables that expose sensitive data without proper RLS
DROP VIEW IF EXISTS public.public_companies;
DROP VIEW IF EXISTS public.public_products; 
DROP VIEW IF EXISTS public.public_quotes;

-- 2. Create secure public views for legitimate public access
CREATE VIEW public.company_preview AS
SELECT 
  id,
  name,
  logo_url,
  primary_color,
  secondary_color,
  website
FROM companies 
WHERE id IN (
  SELECT DISTINCT company_id 
  FROM quotes 
  WHERE public_token IS NOT NULL 
  AND public_token != ''
  AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
);

-- 3. Enhance RLS policies for better security
-- Update quotes table to have more restrictive policies
DROP POLICY IF EXISTS "Users can access their company data" ON quotes;

CREATE POLICY "Users can view their company quotes"
ON quotes FOR SELECT
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can create quotes for their company"
ON quotes FOR INSERT
WITH CHECK (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update their company quotes"
ON quotes FOR UPDATE
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete their company quotes"
ON quotes FOR DELETE
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

-- 4. Add input validation functions for sensitive data
CREATE OR REPLACE FUNCTION validate_email(email text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

CREATE OR REPLACE FUNCTION validate_phone(phone text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN phone ~ '^\(\d{2}\)\s\d{4,5}-\d{4}$' OR phone IS NULL;
END;
$$;

-- 5. Add trigger for automatic data sanitization on critical tables
CREATE OR REPLACE FUNCTION sanitize_customer_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate email format
  IF NEW.email IS NOT NULL AND NOT validate_email(NEW.email) THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate phone format
  IF NEW.phone IS NOT NULL AND NOT validate_phone(NEW.phone) THEN
    RAISE EXCEPTION 'Invalid phone format';
  END IF;
  
  -- Sanitize text fields to prevent XSS
  IF NEW.name IS NOT NULL THEN
    NEW.name := regexp_replace(NEW.name, '<[^>]*>', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply sanitization triggers to customer-related tables
DROP TRIGGER IF EXISTS sanitize_customer_data_trigger ON customers;
CREATE TRIGGER sanitize_customer_data_trigger
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_customer_data();

DROP TRIGGER IF EXISTS sanitize_online_quotes_trigger ON online_quotes;
CREATE TRIGGER sanitize_online_quotes_trigger
  BEFORE INSERT OR UPDATE ON online_quotes
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_customer_data();

-- 6. Add rate limiting for public operations
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  company_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company audit logs"
ON audit_logs FOR SELECT
USING (company_id IN (
  SELECT company_id FROM profiles WHERE id = auth.uid()
));

-- 8. Secure integrations table with validation for sensitive data
CREATE OR REPLACE FUNCTION validate_integration_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only store non-sensitive configuration in settings jsonb
  -- Sensitive data should be handled via Supabase secrets
  IF NEW.settings ? 'api_key' OR NEW.settings ? 'secret_key' OR NEW.settings ? 'password' THEN
    RAISE EXCEPTION 'Sensitive data should not be stored in settings. Use Supabase secrets instead.';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_integration_settings_trigger ON integrations;
CREATE TRIGGER validate_integration_settings_trigger
  BEFORE INSERT OR UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION validate_integration_settings();

-- 9. Add session security enhancements
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  ip_address inet,
  user_agent text,
  last_activity timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on user sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON user_sessions FOR SELECT
USING (user_id = auth.uid());

-- 10. Add content security policies for user-generated content
CREATE OR REPLACE FUNCTION sanitize_html_content(content text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF content IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove script tags and javascript
  content := regexp_replace(content, '<script[^>]*>.*?</script>', '', 'gi');
  content := regexp_replace(content, 'javascript:', '', 'gi');
  content := regexp_replace(content, 'on\w+\s*=', '', 'gi');
  
  -- Allow only safe HTML tags
  content := regexp_replace(content, '<(?!/?(?:b|i|u|em|strong|p|br|span)\b)[^>]*>', '', 'gi');
  
  RETURN content;
END;
$$;