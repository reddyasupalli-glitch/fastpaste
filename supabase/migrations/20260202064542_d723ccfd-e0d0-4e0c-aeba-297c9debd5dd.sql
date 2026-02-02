-- Create a trigger to automatically set session_token from the request header
CREATE OR REPLACE FUNCTION public.set_paste_session_token()
RETURNS TRIGGER AS $$
BEGIN
  -- If session_token is not set, get it from the request header
  IF NEW.session_token IS NULL THEN
    NEW.session_token := public.get_session_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for pastes table
DROP TRIGGER IF EXISTS set_paste_session_token_trigger ON public.pastes;
CREATE TRIGGER set_paste_session_token_trigger
  BEFORE INSERT ON public.pastes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_paste_session_token();

-- Update the RLS policy to allow inserts without session_token (the trigger will set it)
DROP POLICY IF EXISTS "Anyone can create pastes" ON public.pastes;
CREATE POLICY "Anyone can create pastes" 
  ON public.pastes 
  FOR INSERT 
  WITH CHECK (true);