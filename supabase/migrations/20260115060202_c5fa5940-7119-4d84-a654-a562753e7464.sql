-- Grant permissions to anon and authenticated roles on groups table
GRANT SELECT, INSERT ON public.groups TO anon;
GRANT SELECT, INSERT ON public.groups TO authenticated;

-- Also ensure room_sessions has proper grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_sessions TO authenticated;

-- Ensure messages has proper grants
GRANT SELECT, INSERT ON public.messages TO anon;
GRANT SELECT, INSERT ON public.messages TO authenticated;

-- Ensure message_reactions has proper grants
GRANT SELECT, INSERT, DELETE ON public.message_reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.message_reactions TO authenticated;