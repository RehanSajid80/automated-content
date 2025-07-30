-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create content_embeddings table to store vector embeddings of content
CREATE TABLE public.content_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE,
  content_text TEXT NOT NULL,
  content_type TEXT NOT NULL,
  topic_area TEXT,
  keywords TEXT[],
  embedding vector(1536), -- OpenAI ada-002 embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;

-- Create policies for content_embeddings
CREATE POLICY "Allow public read access to content embeddings" 
ON public.content_embeddings 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to content embeddings" 
ON public.content_embeddings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to content embeddings" 
ON public.content_embeddings 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to content embeddings" 
ON public.content_embeddings 
FOR DELETE 
USING (true);

-- Create index for vector similarity search
CREATE INDEX content_embeddings_embedding_idx ON public.content_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for content type and topic filtering
CREATE INDEX content_embeddings_type_topic_idx ON public.content_embeddings (content_type, topic_area);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_embeddings_updated_at
  BEFORE UPDATE ON public.content_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();