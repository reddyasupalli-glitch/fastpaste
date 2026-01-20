-- Fix the groups INSERT policy to use 'public' role (includes anon)
-- and also fix the UPDATE policy to be restricted properly

DROP POLICY IF EXISTS "groups_insert_policy" ON public.groups;
DROP POLICY IF EXISTS "groups_update_policy" ON public.groups;

-- INSERT: Allow public role (which includes anonymous users)
CREATE POLICY "groups_insert_policy"
ON public.groups
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (room_type = 'public');

-- UPDATE: Only service_role can update (already was, but ensure it's clean)
CREATE POLICY "groups_update_policy"
ON public.groups
AS PERMISSIVE
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');