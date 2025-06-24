
-- Create api_keys table for storing encrypted API keys
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, service_name, key_name)
);

-- Update webhook_configs table to include missing columns
ALTER TABLE public.webhook_configs 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Update the webhook_configs table to use 'type' instead of 'webhook_type' for consistency
UPDATE public.webhook_configs SET type = webhook_type WHERE type IS NULL;
UPDATE public.webhook_configs SET url = webhook_url WHERE url IS NULL;

-- Update content_library table to include missing columns
ALTER TABLE public.content_library 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'general',
ADD COLUMN IF NOT EXISTS topic_area TEXT,
ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_saved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_selected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Add Row Level Security (RLS) policies
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for api_keys (users can only access their own keys)
CREATE POLICY "Users can view their own API keys" 
  ON public.api_keys 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" 
  ON public.api_keys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" 
  ON public.api_keys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" 
  ON public.api_keys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_service_name ON public.api_keys(service_name);
CREATE INDEX IF NOT EXISTS idx_webhook_configs_type ON public.webhook_configs(type);

-- Create function to execute raw SQL (needed for backwards compatibility)
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT, params JSONB DEFAULT '[]'::JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  query_text TEXT;
BEGIN
  -- This is a simplified version for basic queries
  -- In production, you'd want more sophisticated parameter handling
  query_text := sql;
  
  -- Execute the query and return results as JSONB
  EXECUTE query_text INTO result;
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
