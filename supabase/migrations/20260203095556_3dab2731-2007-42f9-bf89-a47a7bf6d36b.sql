-- Fix security: Create secure views that hide session tokens
-- These views will be used by the application instead of direct table access

-- 1. Create a secure view for pastes that hides session_token
CREATE OR REPLACE VIEW public.pastes_public AS
SELECT 
  id, title, content, language, visibility, 
  burn_after_read, views, expires_at, created_at
FROM public.pastes
WHERE visibility = 'public' AND (expires_at IS NULL OR expires_at > now());

-- 2. Create a secure view for coding rooms that hides session_token
CREATE OR REPLACE VIEW public.coding_rooms_public AS
SELECT 
  id, code, name, content, language, is_private, 
  last_activity_at, created_at
FROM public.coding_rooms
WHERE is_private = false;

-- 3. Create a secure view for coding room participants that hides session_token
CREATE OR REPLACE VIEW public.coding_room_participants_public AS
SELECT 
  id, room_id, username, last_seen_at, created_at
FROM public.coding_room_participants;

-- 4. Add password_hash column to pastes for password protection
ALTER TABLE public.pastes 
ADD COLUMN IF NOT EXISTS password_hash text;

-- 5. Add access_code column to pastes for shareable access codes
ALTER TABLE public.pastes 
ADD COLUMN IF NOT EXISTS access_code text;

-- 6. Add forked_from column to track paste forks
ALTER TABLE public.pastes 
ADD COLUMN IF NOT EXISTS forked_from text;

-- 7. Create function to verify paste password
CREATE OR REPLACE FUNCTION public.verify_paste_password(paste_id text, password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_password_hash text;
BEGIN
  SELECT p.password_hash INTO v_password_hash
  FROM public.pastes p
  WHERE p.id = paste_id;
  
  IF v_password_hash IS NULL THEN
    RETURN true; -- No password set
  END IF;
  
  RETURN v_password_hash = encode(extensions.digest(password::bytea, 'sha256'), 'hex');
END;
$$;

-- 8. Create function to hash password for paste
CREATE OR REPLACE FUNCTION public.hash_paste_password(password text)
RETURNS text
LANGUAGE sql
IMMUTABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT encode(extensions.digest(password::bytea, 'sha256'), 'hex')
$$;

-- 9. Update view_paste to check password (returns null content if password required)
CREATE OR REPLACE FUNCTION public.view_paste(paste_id text, password text DEFAULT NULL)
RETURNS TABLE(
  id text, title text, content text, language text, 
  visibility text, burn_after_read boolean, views integer, 
  expires_at timestamp with time zone, created_by text, 
  created_at timestamp with time zone, requires_password boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paste RECORD;
  v_requires_password boolean;
BEGIN
  -- Get the paste
  SELECT p.* INTO v_paste
  FROM public.pastes p
  WHERE p.id = paste_id
  AND (p.expires_at IS NULL OR p.expires_at > now());
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if password is required
  v_requires_password := v_paste.password_hash IS NOT NULL;
  
  -- If password required but not provided or incorrect
  IF v_requires_password AND (
    password IS NULL OR 
    v_paste.password_hash != encode(extensions.digest(password::bytea, 'sha256'), 'hex')
  ) THEN
    -- Return paste info but hide content
    RETURN QUERY
    SELECT v_paste.id, v_paste.title, ''::text as content, v_paste.language,
           v_paste.visibility, v_paste.burn_after_read, v_paste.views,
           v_paste.expires_at, v_paste.created_by, v_paste.created_at, true as requires_password;
    RETURN;
  END IF;
  
  -- Increment views
  UPDATE public.pastes p
  SET views = p.views + 1
  WHERE p.id = paste_id;
  
  -- Return the paste
  RETURN QUERY
  SELECT v_paste.id, v_paste.title, v_paste.content, v_paste.language,
         v_paste.visibility, v_paste.burn_after_read, v_paste.views + 1,
         v_paste.expires_at, v_paste.created_by, v_paste.created_at, false as requires_password;
  
  -- Delete if burn after read
  IF v_paste.burn_after_read THEN
    DELETE FROM public.pastes p WHERE p.id = paste_id;
  END IF;
END;
$$;

-- 10. Create function to fork a paste
CREATE OR REPLACE FUNCTION public.fork_paste(source_paste_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source RECORD;
  v_new_id text;
BEGIN
  -- Get source paste (must be public and not expired)
  SELECT * INTO v_source
  FROM public.pastes
  WHERE id = source_paste_id
  AND visibility = 'public'
  AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Paste not found or not forkable';
  END IF;
  
  -- Create new paste
  INSERT INTO public.pastes (
    title, content, language, visibility, 
    burn_after_read, forked_from, session_token
  ) VALUES (
    COALESCE(v_source.title, '') || ' (fork)',
    v_source.content,
    v_source.language,
    'public',
    false,
    source_paste_id,
    public.get_session_token()
  ) RETURNING id INTO v_new_id;
  
  RETURN v_new_id;
END;
$$;

-- 11. Generate unique access code for pastes
CREATE OR REPLACE FUNCTION public.generate_paste_access_code()
RETURNS text
LANGUAGE sql
AS $$
  SELECT substr(encode(gen_random_bytes(6), 'base64'), 1, 8);
$$;

-- 12. Update RLS policy for unlisted pastes with access code
DROP POLICY IF EXISTS "Anyone can read public pastes" ON public.pastes;
CREATE POLICY "Anyone can read accessible pastes"
  ON public.pastes
  FOR SELECT
  USING (
    visibility = 'public' 
    OR session_token = get_session_token()
    OR (visibility = 'unlisted' AND access_code IS NOT NULL)
  );

-- 13. Create function to delete paste (owner only)
CREATE OR REPLACE FUNCTION public.delete_paste(paste_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.pastes
  WHERE id = paste_id AND session_token = get_session_token();
  
  RETURN FOUND;
END;
$$;

-- 14. Create function to delete coding room (owner only)
CREATE OR REPLACE FUNCTION public.delete_coding_room(room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete participants first
  DELETE FROM public.coding_room_participants
  WHERE room_id = delete_coding_room.room_id;
  
  -- Delete the room
  DELETE FROM public.coding_rooms
  WHERE id = room_id AND session_token = get_session_token();
  
  RETURN FOUND;
END;
$$;