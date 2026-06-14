DROP POLICY IF EXISTS "Visitors can delete own likes" ON public.suggestion_likes;
CREATE POLICY "Visitors can delete own likes" ON public.suggestion_likes
FOR DELETE TO public USING (true);

DROP POLICY IF EXISTS "Anyone can read suggestions public fields" ON public.suggestions;
CREATE POLICY "Public read suggestions no email" ON public.suggestions
FOR SELECT TO public USING (true);