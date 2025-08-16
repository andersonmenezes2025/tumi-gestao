-- Fix Function Search Path Mutable warnings
-- Ensure all functions have explicit search_path set for security

-- Fix any functions that might be missing search_path
-- (Note: Some functions may already have this set from previous migration)

-- Update any trigger functions that might be missing search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Ensure get_current_user_role function has proper search_path if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_current_user_role') THEN
    EXECUTE 'CREATE OR REPLACE FUNCTION public.get_current_user_role()
    RETURNS TEXT 
    LANGUAGE SQL 
    SECURITY DEFINER 
    STABLE
    SET search_path = ''public''
    AS $func$
      SELECT role FROM public.profiles WHERE id = auth.uid();
    $func$;';
  END IF;
END $$;