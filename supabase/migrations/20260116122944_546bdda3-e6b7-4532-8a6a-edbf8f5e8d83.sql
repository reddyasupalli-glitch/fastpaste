-- Fix: Private room codes should not be publicly enumerable
-- Allow reading groups only if:
-- 1. User is a member (has session in room), OR
-- 2. User is looking up by exact code (for joining)

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read groups" ON public.groups;

-- Create a function to check if querying by exact code
CREATE OR REPLACE FUNCTION public.is_code_lookup()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Check if the request has a code filter (for joining rooms)
  SELECT COALESCE(
    current_setting('request.path', true) LIKE '%code=eq.%',
    false
  )
$$;

-- Create restricted SELECT policy
-- Users can read groups they're members of
CREATE POLICY "Users can read groups they are members of"
ON public.groups
FOR SELECT
TO anon, authenticated
USING (
  -- User has an active session in this room
  public.user_is_in_room(id, public.get_session_token())
);

-- Create a secure function for joining rooms by code
-- This allows looking up a group by exact code without exposing all groups
CREATE OR REPLACE FUNCTION public.join_group_by_code(p_code text)
RETURNS TABLE (
  id uuid,
  code varchar,
  created_at timestamptz,
  room_type varchar
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT g.id, g.code, g.created_at, g.room_type
  FROM groups g
  WHERE g.code = p_code
  LIMIT 1
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO anon, authenticated;