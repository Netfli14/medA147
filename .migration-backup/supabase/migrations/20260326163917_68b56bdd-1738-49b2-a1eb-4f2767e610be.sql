
CREATE TABLE public.suggestion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id uuid NOT NULL REFERENCES public.suggestions(id) ON DELETE CASCADE,
  reply_text text NOT NULL,
  author_name text,
  is_creator boolean NOT NULL DEFAULT false,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suggestion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read replies" ON public.suggestion_replies FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert replies" ON public.suggestion_replies FOR INSERT TO public WITH CHECK (true);
