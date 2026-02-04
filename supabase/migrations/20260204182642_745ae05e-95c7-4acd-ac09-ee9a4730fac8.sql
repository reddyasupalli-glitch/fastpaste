-- Drop insecure public views that expose sensitive data
-- We use secure SECURITY DEFINER RPC functions instead

DROP VIEW IF EXISTS public.coding_rooms_public;
DROP VIEW IF EXISTS public.coding_room_participants_public;
DROP VIEW IF EXISTS public.pastes_public;