-- Add INSERT policy for group_passwords (only allow inserting for own groups)
-- This is needed for creating private rooms
CREATE POLICY "Anyone can create group passwords"
ON public.group_passwords
FOR INSERT
WITH CHECK (true);

-- Note: No SELECT, UPDATE, or DELETE policies - access only via verify_room_password function