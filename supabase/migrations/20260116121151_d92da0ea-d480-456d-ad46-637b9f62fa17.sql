-- Drop all existing policies on groups and recreate them properly
DROP POLICY IF EXISTS "Anyone can create groups" ON public.groups;
DROP POLICY IF EXISTS "Users can read groups they have joined" ON public.groups;
DROP POLICY IF EXISTS "Service role can delete groups" ON public.groups;

-- Allow anyone to create groups (anonymous chat app)
CREATE POLICY "Anyone can create groups"
ON public.groups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anyone to read any group (needed for joining by code)
CREATE POLICY "Anyone can read groups"
ON public.groups
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow service role to delete groups (for cleanup)
CREATE POLICY "Service role can delete groups"
ON public.groups
FOR DELETE
TO service_role
USING (true);