-- Remove private room feature completely

-- Drop the group_passwords table (contains password hashes)
DROP TABLE IF EXISTS public.group_passwords CASCADE;

-- Drop password verification function
DROP FUNCTION IF EXISTS public.verify_room_password(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.hash_password_secure(text) CASCADE;

-- Update all existing rooms to be public (in case any private ones exist)
UPDATE public.groups SET room_type = 'public' WHERE room_type = 'private';

-- Add constraint to ensure room_type is always 'public'
-- First drop the existing check if it exists
ALTER TABLE public.groups DROP CONSTRAINT IF EXISTS check_room_type;

-- Add new constraint that only allows 'public'
ALTER TABLE public.groups ADD CONSTRAINT check_room_type CHECK (room_type = 'public');