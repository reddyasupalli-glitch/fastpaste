-- Add room_type column (public or private)
ALTER TABLE public.groups 
ADD COLUMN room_type VARCHAR(10) NOT NULL DEFAULT 'public' CHECK (room_type IN ('public', 'private'));

-- Add password_hash column for private rooms
ALTER TABLE public.groups 
ADD COLUMN password_hash TEXT;

-- Create index for faster lookups
CREATE INDEX idx_groups_room_type ON public.groups(room_type);