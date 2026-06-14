
CREATE TABLE public.user_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  user_name text,
  function_name text NOT NULL,
  action_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log actions" ON public.user_actions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Authenticated can read all actions" ON public.user_actions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.user_premium (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_premium ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own premium" ON public.user_premium FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can insert premium" ON public.user_premium FOR INSERT TO public WITH CHECK (true);
