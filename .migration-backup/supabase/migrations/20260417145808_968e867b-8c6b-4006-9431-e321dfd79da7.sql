-- Medical profiles
CREATE TABLE public.medical_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  age INTEGER,
  gender TEXT,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  blood_type TEXT,
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  emergency_contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.medical_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.medical_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.medical_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profile" ON public.medical_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_medical_profiles_user ON public.medical_profiles(user_id);

-- Chat history with AI Doctor
CREATE TABLE public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  language TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chats" ON public.chat_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chats" ON public.chat_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own chats" ON public.chat_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_chat_history_user_created ON public.chat_history(user_id, created_at DESC);
CREATE INDEX idx_chat_history_session ON public.chat_history(session_id);

-- Symptom analysis history
CREATE TABLE public.symptom_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptoms JSONB,
  description TEXT,
  result JSONB,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.symptom_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own symptom history" ON public.symptom_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own symptom history" ON public.symptom_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own symptom history" ON public.symptom_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_symptom_history_user_created ON public.symptom_history(user_id, created_at DESC);

-- updated_at trigger fn
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_medical_profiles_updated
BEFORE UPDATE ON public.medical_profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Multilingual suggestions
ALTER TABLE public.suggestions
  ADD COLUMN IF NOT EXISTS suggestion_en TEXT,
  ADD COLUMN IF NOT EXISTS suggestion_ru TEXT,
  ADD COLUMN IF NOT EXISTS suggestion_kk TEXT,
  ADD COLUMN IF NOT EXISTS suggestion_zh TEXT,
  ADD COLUMN IF NOT EXISTS original_lang TEXT DEFAULT 'en';

-- Recreate the public view to include new translation columns
DROP VIEW IF EXISTS public.suggestions_public;
CREATE VIEW public.suggestions_public
WITH (security_invoker = true)
AS
SELECT id, name, category, suggestion, suggestion_en, suggestion_ru, suggestion_kk, suggestion_zh, original_lang, created_at
FROM public.suggestions;

GRANT SELECT ON public.suggestions_public TO anon, authenticated;