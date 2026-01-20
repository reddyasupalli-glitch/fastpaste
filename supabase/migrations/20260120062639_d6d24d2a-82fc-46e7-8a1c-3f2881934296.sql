-- Fix the INSERT policy on groups - it was created as RESTRICTIVE instead of PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create groups" ON public.groups;

CREATE POLICY "Anyone can create groups"
ON public.groups
FOR INSERT
TO anon, authenticated
WITH CHECK (true);