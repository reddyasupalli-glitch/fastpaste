-- Create a room_sessions table to track active room access
CREATE TABLE public.room_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  username VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, session_token)
);

-- Enable RLS on room_sessions
ALTER TABLE public.room_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a session (join a room)
CREATE POLICY "Anyone can create room sessions"
ON public.room_sessions
FOR INSERT
WITH CHECK (true);

-- Policy: Users can read their own sessions
CREATE POLICY "Users can read own sessions"
ON public.room_sessions
FOR SELECT
USING (session_token = current_setting('request.headers', true)::json->>'x-session-token');

-- Policy: Users can update their own sessions (for last_seen_at)
CREATE POLICY "Users can update own sessions"
ON public.room_sessions
FOR UPDATE
USING (session_token = current_setting('request.headers', true)::json->>'x-session-token');

-- Policy: Users can delete their own sessions (leave room)
CREATE POLICY "Users can delete own sessions"
ON public.room_sessions
FOR DELETE
USING (session_token = current_setting('request.headers', true)::json->>'x-session-token');

-- Drop the old permissive messages SELECT policy
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;

-- Create new restrictive policy: Only read messages if user has active session for that group
CREATE POLICY "Users can read messages in their active rooms"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.room_sessions
    WHERE room_sessions.group_id = messages.group_id
    AND room_sessions.session_token = current_setting('request.headers', true)::json->>'x-session-token'
  )
);

-- Create index for performance
CREATE INDEX idx_room_sessions_group_token ON public.room_sessions(group_id, session_token);
CREATE INDEX idx_room_sessions_last_seen ON public.room_sessions(last_seen_at);