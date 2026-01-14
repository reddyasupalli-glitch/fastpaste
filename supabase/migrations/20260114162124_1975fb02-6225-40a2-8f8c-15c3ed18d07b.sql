-- Drop the current service-role-only policy
DROP POLICY IF EXISTS "Service role can read groups" ON public.groups;

-- Create a policy that allows reading groups only when querying by specific code
-- This prevents bulk enumeration while allowing room lookup
CREATE POLICY "Can read groups by code only"
ON public.groups
FOR SELECT
USING (
  -- Allow service role full access
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  OR
  -- Allow reading only if filtering by a specific code (prevents enumeration)
  code = current_setting('request.query', true)::json->>'code'
);

-- The groups_public view inherits these policies due to security_invoker = on
-- Users can only look up rooms by their exact code, not enumerate all rooms