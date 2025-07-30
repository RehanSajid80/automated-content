import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      query, 
      content_type, 
      topic_area, 
      limit = 5,
      similarity_threshold = 0.7 
    } = await req.json();

    if (!query) {
      throw new Error('Query is required');
    }

    console.log('RAG Search Request:', { query, content_type, topic_area, limit });

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Build similarity search query
    let similarityQuery = supabase
      .from('content_embeddings')
      .select(`
        id,
        content_id,
        content_text,
        content_type,
        topic_area,
        keywords,
        metadata,
        content_library!inner(title, content, created_at)
      `)
      .order('embedding <-> query_embedding')
      .limit(limit);

    // Add content type filter if specified
    if (content_type && content_type !== 'all') {
      similarityQuery = similarityQuery.eq('content_type', content_type);
    }

    // Add topic area filter if specified
    if (topic_area && topic_area !== 'all') {
      similarityQuery = similarityQuery.eq('topic_area', topic_area);
    }

    // Execute the similarity search using RPC call
    const { data: similarContent, error: searchError } = await supabase.rpc(
      'match_content_embeddings',
      {
        query_embedding: queryEmbedding,
        match_threshold: similarity_threshold,
        match_count: limit,
        content_type_filter: content_type === 'all' ? null : content_type,
        topic_area_filter: topic_area === 'all' ? null : topic_area
      }
    );

    if (searchError) {
      console.error('Search error:', searchError);
      // Fallback to basic search if RPC doesn't exist
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from('content_embeddings')
        .select(`
          id,
          content_id,
          content_text,
          content_type,
          topic_area,
          keywords,
          metadata,
          content_library!inner(title, content, created_at)
        `)
        .limit(limit);

      if (fallbackError) {
        throw new Error(`Search failed: ${fallbackError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        results: fallbackResults || [],
        query,
        method: 'fallback',
        count: (fallbackResults || []).length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format results for better usability
    const formattedResults = (similarContent || []).map((item: any) => ({
      id: item.id,
      content_id: item.content_id,
      title: item.content_library?.title || 'Untitled',
      content: item.content_library?.content || item.content_text,
      content_type: item.content_type,
      topic_area: item.topic_area,
      keywords: item.keywords || [],
      similarity_score: item.similarity,
      created_at: item.content_library?.created_at,
      excerpt: item.content_text.substring(0, 200) + '...'
    }));

    console.log(`Found ${formattedResults.length} similar content pieces`);

    return new Response(JSON.stringify({
      success: true,
      results: formattedResults,
      query,
      count: formattedResults.length,
      similarity_threshold,
      method: 'vector_search'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in RAG content search:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});