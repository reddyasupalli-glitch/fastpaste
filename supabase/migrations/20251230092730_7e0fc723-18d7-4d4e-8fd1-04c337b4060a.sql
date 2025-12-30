-- Add file columns to messages table
ALTER TABLE public.messages 
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_type TEXT;

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read files (public bucket)
CREATE POLICY "Anyone can read chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');

-- Allow anyone to upload files
CREATE POLICY "Anyone can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files');

-- Allow file deletion (for cleanup)
CREATE POLICY "Anyone can delete chat files"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-files');