-- Fix security: Add restrictive SELECT policy to coding_room_participants
-- Only allow users to see participants in rooms they're part of

-- First, ensure we have a policy that restricts SELECT access
CREATE POLICY "Users can only view participants in their rooms"
ON public.coding_room_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coding_room_participants crp
    WHERE crp.room_id = coding_room_participants.room_id
    AND crp.session_token = public.get_session_token()
  )
);