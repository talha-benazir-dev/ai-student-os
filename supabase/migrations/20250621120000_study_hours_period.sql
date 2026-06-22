ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS study_hours_period text NOT NULL DEFAULT 'week'
  CHECK (study_hours_period IN ('today', 'week', 'month'));
