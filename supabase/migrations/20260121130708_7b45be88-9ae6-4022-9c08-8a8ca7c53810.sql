-- Add creator tracking to room_sessions
-- The first person to create a session in a group is the creator

-- Create a function to check if user is the room creator
CREATE OR REPLACE FUNCTION public.is_room_creator(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM room_sessions rs
    WHERE rs.group_id = p_group_id
      AND rs.session_token = get_session_token()
      AND rs.created_at = (
        SELECT MIN(created_at) 
        FROM room_sessions 
        WHERE group_id = p_group_id
      )
  )
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.is_room_creator(uuid) TO anon, authenticated;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "groups_delete_policy" ON public.groups;
DROP POLICY IF EXISTS "groups_update_policy" ON public.groups;

-- Create restricted DELETE policy - only room creator can delete
CREATE POLICY "groups_delete_policy"
ON public.groups
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (is_room_creator(id));

-- Create restricted UPDATE policy - only room creator can update
CREATE POLICY "groups_update_policy"
ON public.groups
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (is_room_creator(id))
WITH CHECK (is_room_creator(id));

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');