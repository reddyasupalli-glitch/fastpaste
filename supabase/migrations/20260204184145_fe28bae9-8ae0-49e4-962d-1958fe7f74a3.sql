-- Fix views to use SECURITY INVOKER (default in newer Postgres, but be explicit)
-- Drop and recreate with explicit security_invoker option

DROP VIEW IF EXISTS public.coding_rooms_safe;
DROP VIEW IF EXISTS public.coding_room_participants_safe;
DROP VIEW IF EXISTS public.pastes_safe;
DROP VIEW IF EXISTS public.room_sessions_safe;

-- Recreate with security_invoker = true
CREATE VIEW public.coding_rooms_safe
WITH (security_invoker = true)
AS SELECT 
  id, code, name, content, language, is_private, 
  last_activity_at, created_at
FROM public.coding_rooms;

CREATE VIEW public.coding_room_participants_safe
WITH (security_invoker = true)
AS SELECT 
  id, room_id, username, last_seen_at, created_at
FROM public.coding_room_participants;

CREATE VIEW public.pastes_safe
WITH (security_invoker = true)
AS SELECT 
  id, title, content, language, visibility, 
  burn_after_read, views, expires_at, forked_from, created_at
FROM public.pastes;

CREATE VIEW public.room_sessions_safe
WITH (security_invoker = true)
AS SELECT 
  id, group_id, username, last_seen_at, created_at
FROM public.room_sessions;