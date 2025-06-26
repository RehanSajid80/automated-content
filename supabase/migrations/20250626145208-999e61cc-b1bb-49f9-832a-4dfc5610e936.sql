
-- Create a table for miscellaneous content from the adjustment panel
CREATE TABLE public.misc (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  original_content_id UUID,
  adjustment_instructions TEXT,
  target_persona TEXT,
  target_format TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for the misc table
ALTER TABLE public.misc ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read misc content
CREATE POLICY "Anyone can view misc content" 
  ON public.misc 
  FOR SELECT 
  USING (true);

-- Create policy to allow all users to insert misc content
CREATE POLICY "Anyone can create misc content" 
  ON public.misc 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow all users to update misc content
CREATE POLICY "Anyone can update misc content" 
  ON public.misc 
  FOR UPDATE 
  USING (true);

-- Create policy to allow all users to delete misc content
CREATE POLICY "Anyone can delete misc content" 
  ON public.misc 
  FOR DELETE 
  USING (true);
