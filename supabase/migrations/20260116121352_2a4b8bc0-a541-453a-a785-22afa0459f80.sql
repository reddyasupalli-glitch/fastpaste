-- Recreate groups_public view with correct column name
DROP VIEW IF EXISTS public.groups_public;
CREATE VIEW public.groups_public 
WITH (security_invoker = true)
AS SELECT 
  id,
  code,
  created_at,
  room_type,
  last_activity_at
FROM public.groups;