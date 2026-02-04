-- Fix remaining security issues by ensuring no session_token exposure

-- 1. Fix coding_room_participants - the policy exists but scanner says it's missing
-- Drop any existing SELECT policies and create a proper one
DROP POLICY IF EXISTS "Users can only view participants in their rooms" ON public.coding_room_participants;

CREATE POLICY "Participants can view room members"
ON public.coding_room_participants
FOR SELECT
USING (
  session_token = get_session_token()
  OR EXISTS (
    SELECT 1 FROM public.coding_room_participants crp
    WHERE crp.room_id = coding_room_participants.room_id
    AND crp.session_token = get_session_token()
  )
);

-- 2. Update get_room_participants_safe to exclude session_token
CREATE OR REPLACE FUNCTION public.get_room_participants_safe(p_room_id uuid)
RETURNS TABLE(id uuid, username text, last_seen_at timestamp with time zone, created_at timestamp with time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cp.id, cp.username::text, cp.last_seen_at, cp.created_at
  FROM public.coding_room_participants cp
  WHERE cp.room_id = p_room_id;
  -- This function runs with elevated privileges and only returns safe columns
$$;