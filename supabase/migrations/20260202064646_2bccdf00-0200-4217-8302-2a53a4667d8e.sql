-- Create a trigger to automatically set session_token for coding_rooms
CREATE OR REPLACE FUNCTION public.set_coding_room_session_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_token IS NULL THEN
    NEW.session_token := public.get_session_token();
  END IF;
  IF NEW.created_by IS NULL THEN
    NEW.created_by := public.get_session_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS set_coding_room_session_token_trigger ON public.coding_rooms;
CREATE TRIGGER set_coding_room_session_token_trigger
  BEFORE INSERT ON public.coding_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_coding_room_session_token();

-- Create trigger for coding_room_participants to use hashed session token
CREATE OR REPLACE FUNCTION public.set_participant_session_token()
RETURNS TRIGGER AS $$
BEGIN
  NEW.session_token := public.get_session_token();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS set_participant_session_token_trigger ON public.coding_room_participants;
CREATE TRIGGER set_participant_session_token_trigger
  BEFORE INSERT ON public.coding_room_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.set_participant_session_token();

-- Update coding room participants to have a unique constraint
ALTER TABLE public.coding_room_participants 
DROP CONSTRAINT IF EXISTS coding_room_participants_room_session_unique;

-- Add unique constraint for room_id and session_token combination
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'coding_room_participants_room_session_unique'
  ) THEN
    ALTER TABLE public.coding_room_participants 
    ADD CONSTRAINT coding_room_participants_room_session_unique 
    UNIQUE (room_id, session_token);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;