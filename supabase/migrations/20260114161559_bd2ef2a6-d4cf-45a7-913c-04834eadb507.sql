-- Remove the public SELECT policy on groups table to prevent password_hash exposure
DROP POLICY IF EXISTS "Public can read group info" ON public.groups;

-- Create a restrictive policy that only allows service role to read groups directly
-- This ensures password_hash is only accessible via edge functions
CREATE POLICY "Service role can read groups" 
ON public.groups 
FOR SELECT 
USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- The groups_public view (created earlier) provides safe read access without password_hash
-- Application should use this view for all public queries