-- Fix username impersonation vulnerability by:
-- 1. Preventing username changes on UPDATE
-- 2. Ensuring INSERT validates the session token is hashed properly
-- 3. Adding constraint that ties username to session

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update own session" ON public.room_sessions;
DROP POLICY IF EXISTS "room_sessions_insert_policy" ON public.room_sessions;

-- Create UPDATE policy that prevents username changes
-- Only allow updating last_seen_at, not username
CREATE POLICY "room_sessions_update_policy"
ON public.room_sessions
AS PERMISSIVE
FOR UPDATE
TO anon, authenticated
USING (session_token = public.get_session_token())
WITH CHECK (
  session_token = public.get_session_token()
  -- Ensure username cannot be changed (must match existing)
  AND username = (
    SELECT rs.username 
    FROM public.room_sessions rs 
    WHERE rs.session_token = public.get_session_token() 
    AND rs.group_id = room_sessions.group_id
    LIMIT 1
  )
);

-- Create INSERT policy with proper validation
-- Session token in the row must match the hashed header token
CREATE POLICY "room_sessions_insert_policy"
ON public.room_sessions
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Session token must match the caller's hashed token
  session_token = public.get_session_token()
  -- Group must exist
  AND EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id)
  -- Username must be provided
  AND username IS NOT NULL
  AND length(username) > 0
  AND length(username) <= 50
);

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');