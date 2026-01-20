-- Drop and recreate the INSERT policy with explicit settings
DROP POLICY IF EXISTS "Anyone can create groups" ON public.groups;

-- Create policy that allows anyone to insert
CREATE POLICY "Anyone can create groups"
ON public.groups
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Force PostgREST to reload schema
SELECT pg_notify('pgrst', 'reload schema');