-- Fix all remaining ERROR level security issues

-- 1. Fix pastes SELECT policy - add proper access control
DROP POLICY IF EXISTS "Owners can access their own pastes" ON public.pastes;
DROP POLICY IF EXISTS "Anyone can read accessible pastes" ON public.pastes;

CREATE POLICY "Secure paste access"
ON public.pastes
FOR SELECT
USING (
  -- Owner can always access
  session_token = get_session_token()
  -- Note: Public paste access is handled by SECURITY DEFINER RPC functions
  -- This policy only allows owner access to prevent direct table exposure
);

-- 2. Fix coding_rooms SELECT policy - check is_private properly  
DROP POLICY IF EXISTS "Owners and participants can access rooms" ON public.coding_rooms;

CREATE POLICY "Secure room access"
ON public.coding_rooms
FOR SELECT
USING (
  -- Owner can always access
  session_token = get_session_token()
  OR created_by = get_session_token()
  -- Participants can access
  OR EXISTS (
    SELECT 1 FROM public.coding_room_participants crp
    WHERE crp.room_id = coding_rooms.id
    AND crp.session_token = get_session_token()
  )
  -- Note: Public room listings are handled by SECURITY DEFINER RPC functions
);

-- 3. Fix coding_room_participants - only return own session, use RPC for others
DROP POLICY IF EXISTS "Participants can view room members" ON public.coding_room_participants;

CREATE POLICY "Users can only view their own participant record"
ON public.coding_room_participants
FOR SELECT
USING (session_token = get_session_token());

-- Note: Other participants are fetched via get_room_participants_safe RPC which excludes session_token