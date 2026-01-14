-- Fix the groups_public view to use SECURITY INVOKER instead of SECURITY DEFINER
-- This ensures the view respects the querying user's permissions

ALTER VIEW public.groups_public SET (security_invoker = on);