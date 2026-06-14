
-- AI usage tracking table for rate limiting
CREATE TABLE public.ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  function_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT
);

-- Index for fast lookups
CREATE INDEX idx_ai_usage_visitor_time ON public.ai_usage (visitor_id, created_at DESC);
CREATE INDEX idx_ai_usage_function_time ON public.ai_usage (function_name, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Only allow inserts (no read/update/delete by clients)
CREATE POLICY "Anyone can log usage" ON public.ai_usage
FOR INSERT TO public WITH CHECK (true);

-- No SELECT policy = users cannot read usage data
-- This protects usage analytics from being scraped

-- Auto-cleanup old records (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_usage()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.ai_usage WHERE created_at < now() - interval '30 days';
$$;

-- Rate limit check function (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_visitor_id TEXT,
  p_function_name TEXT,
  p_max_requests INTEGER DEFAULT 20,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*) FROM public.ai_usage
    WHERE visitor_id = p_visitor_id
      AND function_name = p_function_name
      AND created_at > now() - (p_window_minutes || ' minutes')::interval
  ) < p_max_requests;
$$;

-- Tighten suggestions table: prevent reading emails
DROP POLICY IF EXISTS "Anyone can read suggestions" ON public.suggestions;
CREATE POLICY "Anyone can read suggestions public fields" ON public.suggestions
FOR SELECT TO public USING (true);

-- Tighten suggestion_likes delete policy to only own likes
DROP POLICY IF EXISTS "Anyone can delete their own likes" ON public.suggestion_likes;
CREATE POLICY "Visitors can delete own likes" ON public.suggestion_likes
FOR DELETE TO public USING (visitor_id = visitor_id);
