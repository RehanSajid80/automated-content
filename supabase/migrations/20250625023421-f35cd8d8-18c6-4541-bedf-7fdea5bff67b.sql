
-- Create the semrush_keywords table to store cached keyword data
CREATE TABLE public.semrush_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  volume INTEGER DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  difficulty INTEGER DEFAULT 50,
  trend TEXT DEFAULT 'neutral',
  cache_key TEXT NOT NULL,
  topic_area TEXT DEFAULT 'general',
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_semrush_keywords_cache_key ON public.semrush_keywords(cache_key);
CREATE INDEX idx_semrush_keywords_topic_area ON public.semrush_keywords(topic_area);
CREATE INDEX idx_semrush_keywords_domain ON public.semrush_keywords(domain);
CREATE INDEX idx_semrush_keywords_created_at ON public.semrush_keywords(created_at);

-- Since this is global data accessible to all users, we don't need RLS policies
-- The edge function will manage access control through the global API key system
