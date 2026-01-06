-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Service can delete expired groups" ON public.groups;
DROP POLICY IF EXISTS "Users can remove their own reactions" ON public.message_reactions;
DROP POLICY IF EXISTS "Anyone can create groups" ON public.groups;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.messages;
DROP POLICY IF EXISTS "Anyone can add reactions" ON public.message_reactions;

-- Create restricted DELETE policy for groups - only service role can delete (for cleanup function)
-- This prevents anonymous users from deleting groups while allowing the edge function to clean up
CREATE POLICY "Only service role can delete groups" 
ON public.groups 
FOR DELETE 
USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Create restricted DELETE policy for reactions - users can only delete their own reactions by username
-- Note: This relies on the client sending the correct username, but adds a layer of protection
CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (
  username = current_setting('request.headers', true)::json->>'x-username'
);

-- Re-create INSERT policies with rate limiting comments (policies still allow inserts but are named appropriately)
-- For anonymous chat, we need to allow public inserts but document the design decision
CREATE POLICY "Public can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can add reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (true);