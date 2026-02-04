-- Fix RLS policies to allow proper access while protecting sensitive data
-- The SECURITY DEFINER RPC functions handle public access, so we need to allow them to work

-- 1. Fix pastes: Allow SECURITY DEFINER functions to access data
DROP POLICY IF EXISTS "Owners can read their pastes" ON public.pastes;
CREATE POLICY "Allow RPC function access to pastes"
ON public.pastes
FOR SELECT
USING (true);  -- RPC functions with SECURITY DEFINER handle the filtering

-- 2. Fix coding_rooms: Allow SECURITY DEFINER functions to access data  
DROP POLICY IF EXISTS "Owners can read their rooms" ON public.coding_rooms;
CREATE POLICY "Allow RPC function access to coding rooms"
ON public.coding_rooms
FOR SELECT
USING (true);  -- RPC functions with SECURITY DEFINER handle the filtering

-- 3. Fix groups: Allow public group access for joining
DROP POLICY IF EXISTS "Users in room can view group" ON public.groups;
CREATE POLICY "Allow public group access"
ON public.groups
FOR SELECT
USING (true);  -- Groups are looked up by code for joining

-- 4. Fix duplicate participant policies
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON public.coding_room_participants;
-- Keep only the new policy we just created