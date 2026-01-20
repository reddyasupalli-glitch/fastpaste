-- Completely disable and re-enable RLS on groups to reset
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on groups
DROP POLICY IF EXISTS "Anyone can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can read groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Only service role can update groups" ON public.groups;
DROP POLICY IF EXISTS "Service role can delete groups" ON public.groups;

-- Re-enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Create fresh INSERT policy
CREATE POLICY "groups_insert_policy"
ON public.groups
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

-- Create fresh SELECT policy for room members
CREATE POLICY "groups_select_policy"
ON public.groups
AS PERMISSIVE
FOR SELECT
TO public
USING (public.user_is_in_room(id, public.get_session_token()));

-- Service role policies for update/delete
CREATE POLICY "groups_update_policy"
ON public.groups
AS PERMISSIVE
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "groups_delete_policy"
ON public.groups
AS PERMISSIVE
FOR DELETE
TO service_role
USING (true);

-- Force schema reload
SELECT pg_notify('pgrst', 'reload schema');