-- Fix security: Prevent direct SELECT access to tables with session_token
-- Force all reads through secure views or functions

-- 1. Update coding_rooms SELECT policy to only allow owners to see their own data
DROP POLICY IF EXISTS "Anyone can read public coding rooms" ON public.coding_rooms;
CREATE POLICY "Owners can read their rooms"
  ON public.coding_rooms
  FOR SELECT
  USING (session_token = get_session_token());

-- 2. Create a secure function to list public rooms (for room listing)
CREATE OR REPLACE FUNCTION public.list_public_rooms(limit_count integer DEFAULT 20)
RETURNS TABLE(
  id uuid, code text, name text, language text,
  last_activity_at timestamptz, created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- 3. Update pastes SELECT policy - only owners can read their own pastes directly
DROP POLICY IF EXISTS "Anyone can read accessible pastes" ON public.pastes;
CREATE POLICY "Owners can read their pastes"
  ON public.pastes
  FOR SELECT
  USING (session_token = get_session_token());

-- 4. Create secure function to list public pastes
CREATE OR REPLACE FUNCTION public.list_public_pastes(limit_count integer DEFAULT 20)
RETURNS TABLE(
  id text, title text, language text, visibility text,
  burn_after_read boolean, views integer, 
  expires_at timestamptz, created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- 5. Create secure function to get room participants (without session_token)
CREATE OR REPLACE FUNCTION public.get_room_participants_safe(p_room_id uuid)
RETURNS TABLE(
  id uuid, username text, last_seen_at timestamptz, created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cp.id, cp.username::text, cp.last_seen_at, cp.created_at
  FROM public.coding_room_participants cp
  WHERE cp.room_id = p_room_id;
$$;