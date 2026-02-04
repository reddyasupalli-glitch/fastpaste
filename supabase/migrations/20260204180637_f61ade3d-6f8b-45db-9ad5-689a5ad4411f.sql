-- Fix security: Hide session_token columns from public access
-- The views already exclude session_token, just need to enable RLS on them

-- 1. Drop and recreate pastes_public view without session_token (already done, just ensuring)
DROP VIEW IF EXISTS public.pastes_public;
CREATE VIEW public.pastes_public 
WITH (security_invoker = true)
AS
SELECT 
  id, title, content, language, visibility, 
  burn_after_read, views, expires_at, created_at
FROM public.pastes
WHERE visibility = 'public' AND (expires_at IS NULL OR expires_at > now());

-- 2. Drop and recreate coding_rooms_public view without session_token
DROP VIEW IF EXISTS public.coding_rooms_public;
CREATE VIEW public.coding_rooms_public
WITH (security_invoker = true)
AS
SELECT 
  id, code, name, content, language, is_private, 
  last_activity_at, created_at
FROM public.coding_rooms
WHERE is_private = false;

-- 3. Drop and recreate coding_room_participants_public view without session_token
DROP VIEW IF EXISTS public.coding_room_participants_public;
CREATE VIEW public.coding_room_participants_public
WITH (security_invoker = true)
AS
SELECT 
  id, room_id, username, last_seen_at, created_at
FROM public.coding_room_participants;

-- 4. Update RLS policy for coding_room_participants to not expose session_token
-- Instead of allowing anyone to view, only allow viewing participants in same room
DROP POLICY IF EXISTS "Anyone can view participants" ON public.coding_room_participants;
CREATE POLICY "Users can view participants in their rooms"
  ON public.coding_room_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coding_room_participants cp
      WHERE cp.room_id = coding_room_participants.room_id
      AND cp.session_token = public.get_session_token()
    )
  );

-- 5. Create a function to safely get room data without exposing session_token
CREATE OR REPLACE FUNCTION public.get_room_by_code(room_code text)
RETURNS TABLE(
  id uuid, code text, name text, content text, language text, 
  is_private boolean, last_activity_at timestamptz, created_at timestamptz,
  is_owner boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id, r.code, r.name, r.content, r.language, 
    r.is_private, r.last_activity_at, r.created_at,
    (r.session_token = get_session_token()) as is_owner
  FROM public.coding_rooms r
  WHERE r.code = upper(room_code)
  AND (r.is_private = false OR r.session_token = get_session_token());
$$;

-- 6. Create a function to safely get paste data without exposing session_token  
CREATE OR REPLACE FUNCTION public.get_paste_by_id(paste_id text)
RETURNS TABLE(
  id text, title text, content text, language text, visibility text,
  burn_after_read boolean, views integer, expires_at timestamptz, 
  created_at timestamptz, is_owner boolean, requires_password boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id, p.title, 
    CASE WHEN p.password_hash IS NOT NULL THEN '' ELSE p.content END as content,
    p.language, p.visibility, p.burn_after_read, p.views, 
    p.expires_at, p.created_at,
    (p.session_token = get_session_token()) as is_owner,
    (p.password_hash IS NOT NULL) as requires_password
  FROM public.pastes p
  WHERE p.id = paste_id
  AND (p.visibility = 'public' OR p.session_token = get_session_token() OR (p.visibility = 'unlisted' AND p.access_code IS NOT NULL))
  AND (p.expires_at IS NULL OR p.expires_at > now());
$$;