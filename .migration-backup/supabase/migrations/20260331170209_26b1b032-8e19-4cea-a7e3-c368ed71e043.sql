
-- Fix security definer view
ALTER VIEW public.suggestions_public SET (security_invoker = on);
