-- Create a table for product improvement suggestions
CREATE TABLE public.suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  suggestion TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert suggestions
CREATE POLICY "Anyone can submit suggestions" 
ON public.suggestions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading suggestions (for admin purposes)
CREATE POLICY "Anyone can read suggestions" 
ON public.suggestions 
FOR SELECT 
USING (true);