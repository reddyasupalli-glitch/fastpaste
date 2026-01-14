-- Drop the current policy that doesn't work well
DROP POLICY IF EXISTS "Can read groups by code only" ON public.groups;

-- Create policy: Allow reading groups if user has any active room session
-- This means users must have joined at least one room to look up room info
-- This prevents anonymous enumeration while allowing legitimate lookups
CREATE POLICY "Users with sessions can read groups"
ON public.groups
FOR SELECT
USING (
  -- Allow service role full access (for edge functions)
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  OR
  -- Allow if user has an active session token (has joined any room)
  EXISTS (
    SELECT 1 FROM public.room_sessions
    WHERE room_sessions.session_token = current_setting('request.headers', true)::json->>'x-session-token'
  )
);