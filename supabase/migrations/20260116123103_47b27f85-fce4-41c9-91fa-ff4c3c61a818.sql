-- Remove unnecessary groups_public view that creates attack surface
-- The join_group_by_code function now handles secure room lookups
DROP VIEW IF EXISTS public.groups_public;