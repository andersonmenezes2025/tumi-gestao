-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);

-- Create policies for company logos
CREATE POLICY "Company users can upload logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (storage.foldername(name))[2] IN (
    SELECT company_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Anyone can view company logos" ON storage.objects
FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Company users can update their logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Company users can delete their logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);