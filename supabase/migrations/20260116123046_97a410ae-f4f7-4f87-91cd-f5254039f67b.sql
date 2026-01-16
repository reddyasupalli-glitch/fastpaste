-- Fix username spoofing vulnerability
-- Instead of trusting x-username header, verify username through session_token in room_sessions

-- Create a function to get the verified username for current session
CREATE OR REPLACE FUNCTION public.get_verified_username()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rs.username::text
  FROM room_sessions rs
  WHERE rs.session_token = public.get_session_token()
  LIMIT 1
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION public.get_verified_username() TO anon, authenticated;

-- Update messages DELETE policy to use verified username
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
TO anon, authenticated
USING (
  -- Verify username through session token, not header
  username = public.get_verified_username()
  -- Also verify user is in the room
  AND public.user_is_in_room(group_id, public.get_session_token())
);

-- Update message_reactions DELETE policy to use verified username
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.message_reactions;

CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
TO anon, authenticated
USING (
  -- Verify username through session token, not header
  username = public.get_verified_username()
);