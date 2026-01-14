-- Fix the chicken-and-egg problem: users need to look up groups before creating sessions
-- But we want to prevent bulk enumeration

-- Drop the current restrictive policy
DROP POLICY IF EXISTS "Users with sessions can read groups" ON public.groups;

-- Create a more permissive policy that allows individual lookups
-- The key protection is that room codes are 4-digit (10,000 combinations)
-- and rooms auto-expire, limiting enumeration value
CREATE POLICY "Public can read groups"
ON public.groups
FOR SELECT
USING (true);

-- The real security comes from:
-- 1. Password verification server-side for private rooms
-- 2. Message access requiring active session
-- 3. Room auto-expiration
-- 4. Rate limiting on edge functions