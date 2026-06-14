
-- Create a table for tracking likes on suggestions
CREATE TABLE public.suggestion_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_id UUID NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(suggestion_id, visitor_id)
);

-- Enable RLS
ALTER TABLE public.suggestion_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes
CREATE POLICY "Anyone can read likes"
ON public.suggestion_likes
FOR SELECT
USING (true);

-- Anyone can insert likes (one per visitor per suggestion enforced by unique constraint)
CREATE POLICY "Anyone can insert likes"
ON public.suggestion_likes
FOR INSERT
WITH CHECK (true);

-- Anyone can delete their own likes (unlike)
CREATE POLICY "Anyone can delete their own likes"
ON public.suggestion_likes
FOR DELETE
USING (true);
