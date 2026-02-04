-- Drop the views as they're causing more issues than they solve
-- The application uses SECURITY DEFINER RPC functions for all public access
DROP VIEW IF EXISTS public.coding_rooms_safe;
DROP VIEW IF EXISTS public.coding_room_participants_safe;
DROP VIEW IF EXISTS public.pastes_safe;
DROP VIEW IF EXISTS public.room_sessions_safe;