-- Fix 1: Add database constraints for input validation
-- This provides server-side validation that cannot be bypassed

-- Add content length constraint to messages table
ALTER TABLE public.messages 
ADD CONSTRAINT check_content_length CHECK (length(content) <= 10000);

-- Add username format and length constraint to messages table
ALTER TABLE public.messages 
ADD CONSTRAINT check_username_format CHECK (
  length(username) >= 1 AND 
  length(username) <= 50 AND 
  username ~ '^[a-zA-Z0-9_\-\s]+$'
);

-- Add username format constraint to message_reactions table
ALTER TABLE public.message_reactions 
ADD CONSTRAINT check_reaction_username_format CHECK (
  length(username) >= 1 AND 
  length(username) <= 50 AND 
  username ~ '^[a-zA-Z0-9_\-\s]+$'
);

-- Add emoji length constraint to message_reactions table
ALTER TABLE public.message_reactions 
ADD CONSTRAINT check_emoji_length CHECK (length(emoji) <= 10);

-- Add username format constraint to room_sessions table
ALTER TABLE public.room_sessions 
ADD CONSTRAINT check_session_username_format CHECK (
  length(username) >= 1 AND 
  length(username) <= 50 AND 
  username ~ '^[a-zA-Z0-9_\-\s]+$'
);

-- Add message_type validation
ALTER TABLE public.messages
ADD CONSTRAINT check_message_type CHECK (message_type IN ('text', 'code', 'file'));

-- Add room_type validation
ALTER TABLE public.groups
ADD CONSTRAINT check_room_type CHECK (room_type IN ('public', 'private'));

-- Add file metadata constraints
ALTER TABLE public.messages
ADD CONSTRAINT check_file_name_length CHECK (file_name IS NULL OR length(file_name) <= 255);

ALTER TABLE public.messages
ADD CONSTRAINT check_file_type_length CHECK (file_type IS NULL OR length(file_type) <= 100);

-- Fix 2: Add proper password hashing with salt
-- Update verify_room_password function to use PBKDF2 with salt

DROP FUNCTION IF EXISTS public.verify_room_password(text, text);

CREATE OR REPLACE FUNCTION public.verify_room_password(room_code text, input_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
  group_uuid uuid;
  computed_hash text;
BEGIN
  -- Get the group ID
  SELECT id INTO group_uuid 
  FROM public.groups 
  WHERE code = upper(room_code);
  
  IF group_uuid IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Get the stored password hash
  SELECT password_hash INTO stored_hash 
  FROM public.group_passwords 
  WHERE group_id = group_uuid;
  
  IF stored_hash IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if this is a legacy SHA-256 hash (64 hex chars, no colon)
  -- or a new salted hash (format: salt:hash)
  IF position(':' in stored_hash) = 0 THEN
    -- Legacy SHA-256 hash - compute SHA-256 of input for comparison
    -- This maintains backward compatibility with existing rooms
    computed_hash := encode(digest(input_password, 'sha256'), 'hex');
    RETURN stored_hash = computed_hash;
  ELSE
    -- New format with salt - use pgcrypto crypt function
    -- Format: algorithm:salt:hash or just compare with crypt
    RETURN stored_hash = crypt(input_password, stored_hash);
  END IF;
END;
$$;

-- Create function for generating secure password hashes (for use in edge functions)
CREATE OR REPLACE FUNCTION public.hash_password_secure(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use bcrypt via pgcrypto with cost factor 10 (reasonable security/performance balance)
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$;