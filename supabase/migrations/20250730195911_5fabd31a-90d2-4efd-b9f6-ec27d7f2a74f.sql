-- Create RPC function for vector similarity search
CREATE OR REPLACE FUNCTION public.match_content_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  content_type_filter text DEFAULT NULL,
  topic_area_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content_id uuid,
  content_text text,
  content_type text,
  topic_area text,
  keywords text[],
  metadata jsonb,
  similarity float,
  content_library jsonb
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.content_id,
    ce.content_text,
    ce.content_type,
    ce.topic_area,
    ce.keywords,
    ce.metadata,
    1 - (ce.embedding <=> query_embedding) AS similarity,
    to_jsonb(cl.*) AS content_library
  FROM content_embeddings ce
  JOIN content_library cl ON ce.content_id = cl.id
  WHERE 
    1 - (ce.embedding <=> query_embedding) > match_threshold
    AND (content_type_filter IS NULL OR ce.content_type = content_type_filter)
    AND (topic_area_filter IS NULL OR ce.topic_area = topic_area_filter)
  ORDER BY ce.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;