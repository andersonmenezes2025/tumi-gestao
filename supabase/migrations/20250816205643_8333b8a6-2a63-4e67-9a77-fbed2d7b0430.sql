-- Create table for agenda events
CREATE TABLE public.agenda_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  location text,
  type text DEFAULT 'meeting',
  status text DEFAULT 'scheduled',
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

-- Create policies for agenda events
CREATE POLICY "Users can view their company agenda events"
ON public.agenda_events
FOR SELECT
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can create agenda events for their company"
ON public.agenda_events
FOR INSERT
WITH CHECK (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can update their company agenda events"
ON public.agenda_events
FOR UPDATE
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

CREATE POLICY "Users can delete their company agenda events"
ON public.agenda_events
FOR DELETE
USING (company_id IN (
  SELECT profiles.company_id
  FROM profiles
  WHERE profiles.id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agenda_events_updated_at
BEFORE UPDATE ON public.agenda_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();