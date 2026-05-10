
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('owner', 'sister');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Suggestions table
CREATE TABLE public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_name TEXT NOT NULL,
  submitter_email TEXT,
  boy_name TEXT,
  girl_name TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT at_least_one_name CHECK (
    coalesce(trim(boy_name), '') <> '' OR coalesce(trim(girl_name), '') <> ''
  )
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + auth) can insert a suggestion
CREATE POLICY "Anyone can submit a suggestion"
ON public.suggestions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only owner can read full rows
CREATE POLICY "Owner can read all suggestions"
ON public.suggestions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'owner'));

-- Anonymized names function: returns only the names (no PII)
-- Accessible to owner OR sister
CREATE OR REPLACE FUNCTION public.get_anonymous_names()
RETURNS TABLE(boy_name TEXT, girl_name TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'owner') OR public.has_role(auth.uid(), 'sister')) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT s.boy_name, s.girl_name, s.created_at
  FROM public.suggestions s
  ORDER BY s.created_at DESC;
END;
$$;
