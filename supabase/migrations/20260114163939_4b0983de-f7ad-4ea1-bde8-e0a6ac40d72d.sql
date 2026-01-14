-- Restrict groups table to only be readable by users with active sessions
-- The groups_public view is already used for public room lookups

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can read groups" ON public.groups;

-- Create a new policy that restricts groups table access to session holders
-- Users can only read groups where they have an active session
CREATE POLICY "Users can read groups they have joined" ON public.groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_sessions
    WHERE room_sessions.group_id = groups.id
    AND room_sessions.session_token = (current_setting('request.headers', true)::json->>'x-session-token')
  )
);