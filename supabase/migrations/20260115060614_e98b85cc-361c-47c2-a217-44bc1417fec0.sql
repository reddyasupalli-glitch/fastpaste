-- Drop and recreate the INSERT policy with explicit role targeting
DROP POLICY IF EXISTS "Anyone can create groups" ON public.groups;

CREATE POLICY "Anyone can create groups"
ON public.groups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);