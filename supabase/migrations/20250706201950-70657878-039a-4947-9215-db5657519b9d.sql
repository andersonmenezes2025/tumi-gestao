-- Create online quotes table for public quote requests
CREATE TABLE public.online_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  company_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.online_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for online quotes
CREATE POLICY "Company users can view their online quotes" ON public.online_quotes
FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Company users can update their online quotes" ON public.online_quotes
FOR UPDATE
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Allow public to insert online quotes (no auth required)
CREATE POLICY "Anyone can create online quotes" ON public.online_quotes
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_online_quotes_updated_at
BEFORE UPDATE ON public.online_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();