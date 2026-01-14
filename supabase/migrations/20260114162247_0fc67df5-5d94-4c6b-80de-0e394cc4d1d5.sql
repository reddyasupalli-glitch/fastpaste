-- Create a separate table for password hashes with restricted access
CREATE TABLE public.group_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL UNIQUE REFERENCES public.groups(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS - NO policies means no direct access at all
ALTER TABLE public.group_passwords ENABLE ROW LEVEL SECURITY;

-- Create a SECURITY INVOKER function to verify passwords without exposing hashes
-- This function returns only true/false, never the actual hash
CREATE OR REPLACE FUNCTION public.verify_room_password(room_code TEXT, input_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash TEXT;
  input_hash TEXT;
BEGIN
  -- Get the stored hash (this bypasses RLS due to SECURITY DEFINER)
  SELECT gp.password_hash INTO stored_hash
  FROM public.group_passwords gp
  JOIN public.groups g ON g.id = gp.group_id
  WHERE g.code = UPPER(room_code);
  
  -- If no password found, room is either public or doesn't exist
  IF stored_hash IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Compute SHA-256 hash of input (same as client-side)
  input_hash := encode(sha256(input_password::bytea), 'hex');
  
  -- Compare hashes
  RETURN input_hash = stored_hash;
END;
$$;

-- Migrate existing password hashes to the new table
INSERT INTO public.group_passwords (group_id, password_hash)
SELECT id, password_hash FROM public.groups 
WHERE password_hash IS NOT NULL;

-- Remove password_hash from groups table
ALTER TABLE public.groups DROP COLUMN password_hash;