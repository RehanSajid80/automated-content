
-- Enable Row Level Security on semrush_keywords table
ALTER TABLE public.semrush_keywords ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to semrush_keywords
-- This is appropriate since this table contains cached SEMrush data that should be accessible to all users
CREATE POLICY "Allow public read access to semrush keywords"
ON public.semrush_keywords
FOR SELECT
TO public
USING (true);

-- Create policy to allow public insert access for the edge function
-- This allows the SEMrush edge function to insert new keyword data
CREATE POLICY "Allow public insert access to semrush keywords"
ON public.semrush_keywords
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow public update access for cache updates
CREATE POLICY "Allow public update access to semrush keywords"
ON public.semrush_keywords
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create policy to allow public delete access for cache cleanup
CREATE POLICY "Allow public delete access to semrush keywords"
ON public.semrush_keywords
FOR DELETE
TO public
USING (true);
