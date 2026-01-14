-- Fix 1: Restrict message_reactions to only be readable by users with active sessions in the room
-- First drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can read reactions" ON public.message_reactions;

-- Create a new policy that restricts reaction reading to room members via session
CREATE POLICY "Users can read reactions in their active rooms" ON public.message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.room_sessions rs ON rs.group_id = m.group_id
    WHERE m.id = message_reactions.message_id
    AND rs.session_token = (current_setting('request.headers', true)::json->>'x-session-token')
  )
);

-- Fix 2: Block all SELECT access to group_passwords table
-- Password hashes should NEVER be readable by clients - only via edge functions with service role
DROP POLICY IF EXISTS "Anyone can read group passwords" ON public.group_passwords;

-- Ensure no SELECT policy exists (deny by default when RLS is enabled)
-- We don't create any SELECT policy, which means no one can read via client
-- The edge function uses service role key which bypasses RLS