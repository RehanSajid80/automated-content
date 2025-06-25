
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public insert on content_library" ON content_library;
DROP POLICY IF EXISTS "Allow public read on content_library" ON content_library;
DROP POLICY IF EXISTS "Allow public update on content_library" ON content_library;
DROP POLICY IF EXISTS "Allow public delete on content_library" ON content_library;

-- Disable RLS temporarily to reset
ALTER TABLE content_library DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
CREATE POLICY "Enable insert for all users" ON content_library
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Enable select for all users" ON content_library
    FOR SELECT 
    USING (true);

CREATE POLICY "Enable update for all users" ON content_library
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable delete for all users" ON content_library
    FOR DELETE 
    USING (true);
