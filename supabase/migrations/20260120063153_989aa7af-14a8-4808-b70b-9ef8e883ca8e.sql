-- Enable pgcrypto in extensions schema (where Supabase places it)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Create a function to hash session tokens using SHA-256
CREATE OR REPLACE FUNCTION public.hash_session_token(token text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT encode(extensions.digest(token::bytea, 'sha256'), 'hex')
$$;

-- Update get_session_token to return HASHED version of the header token
CREATE OR REPLACE FUNCTION public.get_session_token()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT public.hash_session_token(
    coalesce(
      current_setting('request.headers', true)::json->>'x-session-token',
      ''
    )
  )
$$;

-- Hash all existing session tokens in the database
UPDATE public.room_sessions 
SET session_token = public.hash_session_token(session_token)
WHERE length(session_token) != 64;  -- SHA-256 produces 64 hex chars, skip already hashed

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.hash_session_token(text) TO anon, authenticated;

-- Update user_is_in_room to work with hashed tokens
CREATE OR REPLACE FUNCTION public.user_is_in_room(p_group_id uuid, p_session_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM room_sessions rs
    WHERE rs.group_id = p_group_id
      AND rs.session_token = p_session_token
      AND rs.last_seen_at > now() - interval '30 minutes'
  )
$$;