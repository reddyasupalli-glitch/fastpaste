-- Enable REPLICA IDENTITY FULL for complete row data in realtime updates
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add messages table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Also add groups table for potential future real-time needs
ALTER TABLE public.groups REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;