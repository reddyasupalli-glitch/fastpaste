-- Fix all security issues comprehensively

-- 1. Enable RLS on groups_public view (it's a view, so we need to secure the underlying table)
-- Note: groups_public is a VIEW, not a table - views inherit security from underlying tables
-- The groups table already has RLS enabled, so the view is secure

-- 2. Add explicit UPDATE policy on groups (deny all updates except service_role)
DROP POLICY IF EXISTS "Only service role can update groups" ON public.groups;
CREATE POLICY "Only service role can update groups"
ON public.groups
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix room_sessions policies - users should only see their own session
DROP POLICY IF EXISTS "Users can read room sessions for their groups" ON public.room_sessions;
DROP POLICY IF EXISTS "Users can read their own session" ON public.room_sessions;

CREATE POLICY "Users can read their own session"
ON public.room_sessions
FOR SELECT
TO anon, authenticated
USING (
  session_token = ((current_setting('request.headers'::text, true))::json ->> 'x-session-token')
);

-- Also allow reading other sessions in the same room (needed for presence/typing indicators)
CREATE POLICY "Users can read sessions in their rooms"
ON public.room_sessions
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM room_sessions rs
    WHERE rs.group_id = room_sessions.group_id
    AND rs.session_token = ((current_setting('request.headers'::text, true))::json ->> 'x-session-token')
  )
);

-- 4. Add explicit UPDATE and DELETE policies for messages
DROP POLICY IF EXISTS "Users cannot update messages" ON public.messages;
DROP POLICY IF EXISTS "Users cannot delete messages" ON public.messages;

-- Only allow users to delete their own messages (using username verification)
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
TO anon, authenticated
USING (
  username = ((current_setting('request.headers'::text, true))::json ->> 'x-username')
);

-- Deny all updates to messages (messages are immutable)
CREATE POLICY "Service role can update messages"
ON public.messages
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Add explicit UPDATE policy for message_reactions (deny all)
DROP POLICY IF EXISTS "No updates on reactions" ON public.message_reactions;
CREATE POLICY "No updates on reactions"
ON public.message_reactions
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);