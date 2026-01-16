-- Fix infinite recursion in room_sessions policies
-- Problem: Policy "Users can read sessions in their rooms" references room_sessions table

-- 1. Drop all problematic policies on room_sessions
DROP POLICY IF EXISTS "Users can read own sessions" ON public.room_sessions;
DROP POLICY IF EXISTS "Users can read their own session" ON public.room_sessions;
DROP POLICY IF EXISTS "Users can read sessions in their rooms" ON public.room_sessions;
DROP POLICY IF EXISTS "Anyone can create room sessions" ON public.room_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.room_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.room_sessions;

-- 2. Create a security definer function to check if user is in room
CREATE OR REPLACE FUNCTION public.user_is_in_room(p_group_id uuid, p_session_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM room_sessions
    WHERE group_id = p_group_id
    AND session_token = p_session_token
  )
$$;

-- 3. Create a function to get session token from header
CREATE OR REPLACE FUNCTION public.get_session_token()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json ->> 'x-session-token',
    ''
  )
$$;

-- 4. Create simple, non-recursive policies for room_sessions

-- Anyone can create a session (needed for joining rooms)
CREATE POLICY "Anyone can create room sessions"
ON public.room_sessions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Users can only read their own session (by session token match)
CREATE POLICY "Users can read own session"
ON public.room_sessions
FOR SELECT
TO anon, authenticated
USING (session_token = public.get_session_token());

-- Users can update their own session
CREATE POLICY "Users can update own session"
ON public.room_sessions
FOR UPDATE
TO anon, authenticated
USING (session_token = public.get_session_token())
WITH CHECK (session_token = public.get_session_token());

-- Users can delete their own session
CREATE POLICY "Users can delete own session"
ON public.room_sessions
FOR DELETE
TO anon, authenticated
USING (session_token = public.get_session_token());

-- 5. Fix messages policies to use the security definer function
DROP POLICY IF EXISTS "Users can read messages in their rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their rooms" ON public.messages;

CREATE POLICY "Users can read messages in their rooms"
ON public.messages
FOR SELECT
TO anon, authenticated
USING (public.user_is_in_room(group_id, public.get_session_token()));

CREATE POLICY "Users can create messages in their rooms"
ON public.messages
FOR INSERT
TO anon, authenticated
WITH CHECK (public.user_is_in_room(group_id, public.get_session_token()));

-- 6. Fix message_reactions policies
DROP POLICY IF EXISTS "Users can read reactions in their rooms" ON public.message_reactions;
DROP POLICY IF EXISTS "Users can add reactions in their rooms" ON public.message_reactions;

CREATE POLICY "Users can read reactions in their rooms"
ON public.message_reactions
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_reactions.message_id
    AND public.user_is_in_room(m.group_id, public.get_session_token())
  )
);

CREATE POLICY "Users can add reactions in their rooms"
ON public.message_reactions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_reactions.message_id
    AND public.user_is_in_room(m.group_id, public.get_session_token())
  )
);

-- 7. Create a secure view for room participants (hides session tokens)
CREATE OR REPLACE FUNCTION public.get_room_participants(p_group_id uuid)
RETURNS TABLE (
  id uuid,
  username varchar,
  last_seen_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rs.id, rs.username, rs.last_seen_at, rs.created_at
  FROM room_sessions rs
  WHERE rs.group_id = p_group_id
  AND public.user_is_in_room(p_group_id, public.get_session_token())
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.user_is_in_room(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_session_token() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_room_participants(uuid) TO anon, authenticated;