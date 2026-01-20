-- Create a secure RPC function for joining rooms
-- This ensures the session token is properly hashed server-side

CREATE OR REPLACE FUNCTION public.create_room_session(
  p_group_id uuid,
  p_username text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hashed_token text;
  v_existing_username text;
BEGIN
  -- Get the hashed session token from the header
  v_hashed_token := public.get_session_token();
  
  -- Validate inputs
  IF p_group_id IS NULL THEN
    RAISE EXCEPTION 'Group ID is required';
  END IF;
  
  IF p_username IS NULL OR length(trim(p_username)) = 0 THEN
    RAISE EXCEPTION 'Username is required';
  END IF;
  
  IF length(p_username) > 50 THEN
    RAISE EXCEPTION 'Username too long (max 50 characters)';
  END IF;
  
  -- Check if group exists
  IF NOT EXISTS (SELECT 1 FROM public.groups WHERE id = p_group_id) THEN
    RAISE EXCEPTION 'Group not found';
  END IF;
  
  -- Check if session already exists for this group
  SELECT username INTO v_existing_username
  FROM public.room_sessions
  WHERE group_id = p_group_id AND session_token = v_hashed_token;
  
  IF v_existing_username IS NOT NULL THEN
    -- Session exists, just update last_seen_at (username cannot change)
    UPDATE public.room_sessions
    SET last_seen_at = now()
    WHERE group_id = p_group_id AND session_token = v_hashed_token;
    RETURN true;
  END IF;
  
  -- Create new session with hashed token
  INSERT INTO public.room_sessions (group_id, session_token, username, last_seen_at)
  VALUES (p_group_id, v_hashed_token, trim(p_username), now());
  
  RETURN true;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.create_room_session(uuid, text) TO anon, authenticated;

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');