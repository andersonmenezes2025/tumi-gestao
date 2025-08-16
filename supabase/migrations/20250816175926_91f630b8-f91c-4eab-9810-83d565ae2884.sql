-- Fix critical security issue: Add missing SELECT policy for profiles table
-- This allows users to read their own profile data
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);