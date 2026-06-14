
-- 1. Revoke SELECT on email column from public roles
REVOKE SELECT (email) ON public.suggestions FROM anon, authenticated;

-- 2. Add length constraints on suggestion_replies
ALTER TABLE public.suggestion_replies ADD CONSTRAINT author_name_length CHECK (char_length(author_name) <= 100);
ALTER TABLE public.suggestion_replies ADD CONSTRAINT reply_text_length CHECK (char_length(reply_text) <= 1000);

-- 3. Delete the malicious row
DELETE FROM public.suggestion_replies WHERE author_name LIKE '%localStorage%';
