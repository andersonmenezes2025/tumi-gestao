-- Create a policy to allow public read access to companies for public quote forms
CREATE POLICY "Public can view companies for public quotes" 
ON public.companies 
FOR SELECT 
TO anon
USING (true);