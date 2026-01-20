-- Create a secure RPC function for creating groups
-- This bypasses the RLS complexity and ensures proper validation

CREATE OR REPLACE FUNCTION public.create_group(p_code text)
RETURNS TABLE (id uuid, code varchar, created_at timestamptz, room_type varchar)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate code
  IF p_code IS NULL OR length(trim(p_code)) != 4 THEN
    RAISE EXCEPTION 'Room code must be 4 characters';
  END IF;
  
  -- Check if code already exists
  IF EXISTS (SELECT 1 FROM public.groups g WHERE g.code = upper(trim(p_code))) THEN
    RAISE EXCEPTION 'Room code already exists';
  END IF;
  
  -- Create the group and return it
  RETURN QUERY
  INSERT INTO public.groups (code, room_type)
  VALUES (upper(trim(p_code)), 'public')
  RETURNING groups.id, groups.code, groups.created_at, groups.room_type;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.create_group(text) TO anon, authenticated;

-- Also fix the INSERT policy to explicitly include anon role
DROP POLICY IF EXISTS "groups_insert_policy" ON public.groups;

CREATE POLICY "groups_insert_policy"
ON public.groups
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (room_type = 'public');

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');