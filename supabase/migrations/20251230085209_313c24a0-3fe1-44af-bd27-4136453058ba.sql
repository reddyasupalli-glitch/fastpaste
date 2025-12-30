-- Add last_activity_at column to groups
ALTER TABLE public.groups 
ADD COLUMN last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create function to update group activity on new message
CREATE OR REPLACE FUNCTION public.update_group_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.groups 
  SET last_activity_at = now() 
  WHERE id = NEW.group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update activity when message is sent
CREATE TRIGGER update_group_activity_on_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_group_activity();

-- Allow delete for cleanup (service role will use this)
CREATE POLICY "Service can delete expired groups" 
ON public.groups 
FOR DELETE 
USING (true);