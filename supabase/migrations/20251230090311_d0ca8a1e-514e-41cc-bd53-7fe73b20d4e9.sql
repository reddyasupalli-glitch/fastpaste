-- Add username column to messages
ALTER TABLE public.messages 
ADD COLUMN username VARCHAR(50) NOT NULL DEFAULT 'Anonymous';