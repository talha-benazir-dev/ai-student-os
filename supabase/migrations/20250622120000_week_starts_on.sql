ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS week_starts_on smallint NOT NULL DEFAULT 1
  CHECK (week_starts_on >= 0 AND week_starts_on <= 6);
