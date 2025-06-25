
-- Enable RLS on content_library table (if not already enabled)
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert content
CREATE POLICY "Allow public insert on content_library" ON content_library
    FOR INSERT 
    WITH CHECK (true);

-- Create policy to allow anyone to read content
CREATE POLICY "Allow public read on content_library" ON content_library
    FOR SELECT 
    USING (true);

-- Create policy to allow anyone to update content
CREATE POLICY "Allow public update on content_library" ON content_library
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Create policy to allow anyone to delete content
CREATE POLICY "Allow public delete on content_library" ON content_library
    FOR DELETE 
    USING (true);
