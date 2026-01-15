-- Fix RLS policies for groups table
-- The INSERT policy is RESTRICTIVE which blocks inserts - needs to be PERMISSIVE

-- Drop existing restrictive policies on groups
DROP POLICY IF EXISTS "Public can create groups" ON public.groups;
DROP POLICY IF EXISTS "Only service role can delete groups" ON public.groups;
DROP POLICY IF EXISTS "Users can read groups they have joined" ON public.groups;

-- Create PERMISSIVE policies for groups
CREATE POLICY "Anyone can create groups"
ON public.groups
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read groups they have joined"
ON public.groups
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM room_sessions
    WHERE room_sessions.group_id = groups.id
    AND room_sessions.session_token = (
      (current_setting('request.headers'::text, true))::json->>'x-session-token'
    )
  )
);

CREATE POLICY "Service role can delete groups"
ON public.groups
FOR DELETE
TO service_role
USING (true);

-- Fix messages policies - drop restrictive and create permissive
DROP POLICY IF EXISTS "Public can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read messages in their active rooms" ON public.messages;

CREATE POLICY "Users can create messages in their rooms"
ON public.messages
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM room_sessions
    WHERE room_sessions.group_id = messages.group_id
    AND room_sessions.session_token = (
      (current_setting('request.headers'::text, true))::json->>'x-session-token'
    )
  )
);

CREATE POLICY "Users can read messages in their rooms"
ON public.messages
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM room_sessions
    WHERE room_sessions.group_id = messages.group_id
    AND room_sessions.session_token = (
      (current_setting('request.headers'::text, true))::json->>'x-session-token'
    )
  )
);

-- Fix message_reactions policies - drop restrictive and create permissive
DROP POLICY IF EXISTS "Public can add reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can read reactions in their active rooms" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.message_reactions;

CREATE POLICY "Users can add reactions in their rooms"
ON public.message_reactions
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN room_sessions rs ON rs.group_id = m.group_id
    WHERE m.id = message_reactions.message_id
    AND rs.session_token = (
      (current_setting('request.headers'::text, true))::json->>'x-session-token'
    )
  )
);

CREATE POLICY "Users can read reactions in their rooms"
ON public.message_reactions
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN room_sessions rs ON rs.group_id = m.group_id
    WHERE m.id = message_reactions.message_id
    AND rs.session_token = (
      (current_setting('request.headers'::text, true))::json->>'x-session-token'
    )
  )
);

CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
TO public
USING (
  username = (
    (current_setting('request.headers'::text, true))::json->>'x-username'
  )
);

-- Fix room_sessions policies - drop restrictive and create permissive
DROP POLICY IF EXISTS "Anyone can create room sessions" ON public.room_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.room_sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON public.room_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.room_sessions;

CREATE POLICY "Anyone can create room sessions"
ON public.room_sessions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own sessions"
ON public.room_sessions
FOR SELECT
TO public
USING (
  session_token = (
    (current_setting('request.headers'::text, true))::json->>'x-session-token'
  )
);

CREATE POLICY "Users can update own sessions"
ON public.room_sessions
FOR UPDATE
TO public
USING (
  session_token = (
    (current_setting('request.headers'::text, true))::json->>'x-session-token'
  )
);

CREATE POLICY "Users can delete own sessions"
ON public.room_sessions
FOR DELETE
TO public
USING (
  session_token = (
    (current_setting('request.headers'::text, true))::json->>'x-session-token'
  )
);