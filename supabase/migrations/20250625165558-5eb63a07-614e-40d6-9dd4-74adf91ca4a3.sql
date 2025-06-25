
-- Enable Row Level Security for countries table
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for cities table
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read countries (public data)
CREATE POLICY "Anyone can view countries" 
  ON public.countries 
  FOR SELECT 
  USING (true);

-- Create policy to allow all users to read cities (public data)
CREATE POLICY "Anyone can view cities" 
  ON public.cities 
  FOR SELECT 
  USING (true);

-- Optional: If you need to allow inserts/updates for admin users only
-- (uncomment these if needed for your application)
-- CREATE POLICY "Only authenticated users can insert countries" 
--   ON public.countries 
--   FOR INSERT 
--   TO authenticated
--   WITH CHECK (true);

-- CREATE POLICY "Only authenticated users can insert cities" 
--   ON public.cities 
--   FOR INSERT 
--   TO authenticated
--   WITH CHECK (true);
