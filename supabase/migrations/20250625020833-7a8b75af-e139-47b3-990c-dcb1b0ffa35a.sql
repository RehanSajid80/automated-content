
-- Create RLS policies for the api_keys table to allow global access
-- Since this is designed as a global configuration system, we'll allow public access

-- Policy to allow anyone to select global API keys (where user_id is null)
CREATE POLICY "Allow public read access to global API keys" 
ON public.api_keys 
FOR SELECT 
USING (user_id IS NULL);

-- Policy to allow anyone to insert global API keys (where user_id is null)
CREATE POLICY "Allow public insert access to global API keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (user_id IS NULL);

-- Policy to allow anyone to update global API keys (where user_id is null)
CREATE POLICY "Allow public update access to global API keys" 
ON public.api_keys 
FOR UPDATE 
USING (user_id IS NULL) 
WITH CHECK (user_id IS NULL);

-- Policy to allow anyone to delete global API keys (where user_id is null)
CREATE POLICY "Allow public delete access to global API keys" 
ON public.api_keys 
FOR DELETE 
USING (user_id IS NULL);
