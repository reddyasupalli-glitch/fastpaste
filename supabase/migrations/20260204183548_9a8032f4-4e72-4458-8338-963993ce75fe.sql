-- CRITICAL: Restrict direct table access to prevent session_token exposure
-- All public access must go through SECURITY DEFINER RPC functions

-- 1. Restrict pastes SELECT to owners only (public access via RPC functions)
DROP POLICY IF EXISTS "Allow RPC function access to pastes" ON public.pastes;
CREATE POLICY "Owners can access their own pastes"
ON public.pastes
FOR SELECT
USING (session_token = get_session_token());

-- 2. Restrict coding_rooms SELECT to owners/participants only
DROP POLICY IF EXISTS "Allow RPC function access to coding rooms" ON public.coding_rooms;
CREATE POLICY "Owners and participants can access rooms"
ON public.coding_rooms
FOR SELECT
USING (
  session_token = get_session_token() 
  OR EXISTS (
    SELECT 1 FROM public.coding_room_participants crp
    WHERE crp.room_id = coding_rooms.id
    AND crp.session_token = get_session_token()
  )
);

-- 3. Restrict groups to members only (public access via RPC functions)
DROP POLICY IF EXISTS "Allow public group access" ON public.groups;
CREATE POLICY "Members can access their groups"
ON public.groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_sessions rs
    WHERE rs.group_id = groups.id
    AND rs.session_token = get_session_token()
  )
);

-- 4. Update list_public_rooms to use SECURITY DEFINER properly
CREATE OR REPLACE FUNCTION public.list_public_rooms(limit_count integer DEFAULT 20)
RETURNS TABLE(id uuid, code text, name text, language text, last_activity_at timestamp with time zone, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id, r.code, r.name, r.language,
    r.last_activity_at, r.created_at
  FROM public.coding_rooms r
  WHERE r.is_private = false
  ORDER BY r.last_activity_at DESC
  LIMIT limit_count;
$$;

-- 5. Update list_public_pastes to use SECURITY DEFINER properly  
CREATE OR REPLACE FUNCTION public.list_public_pastes(limit_count integer DEFAULT 20)
RETURNS TABLE(id text, title text, language text, visibility text, burn_after_read boolean, views integer, expires_at timestamp with time zone, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id, p.title, p.language, p.visibility,
    p.burn_after_read, p.views, p.expires_at, p.created_at
  FROM public.pastes p
  WHERE p.visibility = 'public'
  AND (p.expires_at IS NULL OR p.expires_at > now())
  ORDER BY p.created_at DESC
  LIMIT limit_count;
$$;

-- 6. Update get_room_by_code to use SECURITY DEFINER properly
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
  AND (r.is_private = false OR r.session_token = get_session_token());
$$;

-- 7. Create join_group_by_code RPC for group discovery
CREATE OR REPLACE FUNCTION public.join_group_by_code(p_code text)
RETURNS TABLE(id uuid, code varchar, created_at timestamp with time zone, room_type varchar)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.code, g.created_at, g.room_type
  FROM groups g
  WHERE g.code = p_code
  LIMIT 1;
$$;