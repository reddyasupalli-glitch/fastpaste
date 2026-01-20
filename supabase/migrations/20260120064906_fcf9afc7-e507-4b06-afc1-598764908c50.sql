-- Fix overly permissive INSERT policies by adding reasonable constraints

-- 1. Fix groups INSERT policy - require valid room_type value
DROP POLICY IF EXISTS "groups_insert_policy" ON public.groups;

CREATE POLICY "groups_insert_policy"
ON public.groups
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Only allow 'public' room type (the only valid type)
  room_type = 'public'
);

-- 2. Fix room_sessions INSERT policy - require valid group reference
DROP POLICY IF EXISTS "Anyone can create room sessions" ON public.room_sessions;

CREATE POLICY "room_sessions_insert_policy"
ON public.room_sessions
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Session must reference an existing group
  EXISTS (
    SELECT 1 FROM public.groups g WHERE g.id = group_id
  )
  -- Session token must be provided (non-empty after hashing)
  AND session_token IS NOT NULL
  AND length(session_token) > 0
);

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');