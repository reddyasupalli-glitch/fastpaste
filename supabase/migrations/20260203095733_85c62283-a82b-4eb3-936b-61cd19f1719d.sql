-- Fix security issues: Recreate views with SECURITY INVOKER and fix function

-- Drop existing views
DROP VIEW IF EXISTS public.pastes_public;
DROP VIEW IF EXISTS public.coding_rooms_public;
DROP VIEW IF EXISTS public.coding_room_participants_public;

-- Recreate views with explicit SECURITY INVOKER
CREATE VIEW public.pastes_public 
WITH (security_invoker = true)
AS
SELECT 
  id, title, content, language, visibility, 
  burn_after_read, views, expires_at, created_at
FROM public.pastes
WHERE visibility = 'public' AND (expires_at IS NULL OR expires_at > now());

CREATE VIEW public.coding_rooms_public
WITH (security_invoker = true)
AS
SELECT 
  id, code, name, content, language, is_private, 
  last_activity_at, created_at
FROM public.coding_rooms
WHERE is_private = false;

CREATE VIEW public.coding_room_participants_public
WITH (security_invoker = true)
AS
SELECT 
  id, room_id, username, last_seen_at, created_at
FROM public.coding_room_participants;

-- Fix generate_paste_access_code function using extensions schema
CREATE OR REPLACE FUNCTION public.generate_paste_access_code()
RETURNS text
LANGUAGE sql
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  SELECT substr(encode(extensions.gen_random_bytes(6), 'base64'), 1, 8);
$$;