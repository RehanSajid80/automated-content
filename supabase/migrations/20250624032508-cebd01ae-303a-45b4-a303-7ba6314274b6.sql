
-- Create content_library table to store generated content
CREATE TABLE public.content_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  topic_area TEXT,
  keywords TEXT[] DEFAULT '{}',
  is_saved BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_configs table for storing N8N webhook configurations
CREATE TABLE public.webhook_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for content_library (public access for now, can be restricted later)
CREATE POLICY "Allow all access to content_library" 
  ON public.content_library 
  FOR ALL 
  USING (true);

-- Create policies for webhook_configs (public access for now, can be restricted later)
CREATE POLICY "Allow all access to webhook_configs" 
  ON public.webhook_configs 
  FOR ALL 
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_content_library_content_type ON public.content_library(content_type);
CREATE INDEX idx_content_library_topic_area ON public.content_library(topic_area);
CREATE INDEX idx_content_library_created_at ON public.content_library(created_at DESC);
CREATE INDEX idx_webhook_configs_webhook_type ON public.webhook_configs(webhook_type);
