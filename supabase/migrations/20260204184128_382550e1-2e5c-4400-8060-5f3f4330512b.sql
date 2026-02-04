-- CRITICAL: Create secure views that exclude session_token columns
-- Application code should use these views or RPC functions, not direct table access

-- 1. Create secure view for coding_rooms that excludes session_token
CREATE OR REPLACE VIEW public.coding_rooms_safe AS
SELECT 
  id, code, name, content, language, is_private, 
  last_activity_at, created_at
FROM public.coding_rooms;

-- 2. Create secure view for coding_room_participants that excludes session_token
CREATE OR REPLACE VIEW public.coding_room_participants_safe AS
SELECT 
  id, room_id, username, last_seen_at, created_at
FROM public.coding_room_participants;

-- 3. Create secure view for pastes that excludes session_token, password_hash, access_code
CREATE OR REPLACE VIEW public.pastes_safe AS
SELECT 
  id, title, content, language, visibility, 
  burn_after_read, views, expires_at, forked_from, created_at
FROM public.pastes;

-- 4. Create secure view for room_sessions that excludes session_token
CREATE OR REPLACE VIEW public.room_sessions_safe AS
SELECT 
  id, group_id, username, last_seen_at, created_at
FROM public.room_sessions;

-- 5. Update get_room_by_code to return ownership without exposing token
CREATE OR REPLACE FUNCTION public.get_room_by_code(room_code text)
RETURNS TABLE(id uuid, code text, name text, content text, language text, is_private boolean, last_activity_at timestamp with time zone, created_at timestamp with time zone, is_owner boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id, r.code, r.name, r.content, r.language, 
    r.is_private, r.last_activity_at, r.created_at,
    (r.session_token = get_session_token()) as is_owner
  FROM public.coding_rooms r
  WHERE r.code = upper(room_code)
  AND (r.is_private = false OR r.session_token = get_session_token() OR EXISTS (
    SELECT 1 FROM public.coding_room_participants crp 
    WHERE crp.room_id = r.id AND crp.session_token = get_session_token()
  ));
$$;