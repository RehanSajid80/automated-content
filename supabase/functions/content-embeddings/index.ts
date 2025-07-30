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
    const { action, content_id, content_text, content_type, topic_area, keywords } = await req.json();

    if (action === 'generate_embedding') {
      // Generate embedding for content
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: content_text,
        }),
      });

      if (!embeddingResponse.ok) {
        throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Store embedding in database
      const { data, error } = await supabase
        .from('content_embeddings')
        .upsert({
          content_id,
          content_text,
          content_type,
          topic_area,
          keywords,
          embedding,
          metadata: {
            generated_at: new Date().toISOString(),
            model: 'text-embedding-ada-002'
          }
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        embedding_id: data[0].id,
        message: 'Embedding generated and stored successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'bulk_generate') {
      // Generate embeddings for all existing content in content_library
      const { data: contentLibrary, error: fetchError } = await supabase
        .from('content_library')
        .select('id, title, content, content_type, topic_area, keywords')
        .neq('content', '');

      if (fetchError) {
        throw new Error(`Failed to fetch content: ${fetchError.message}`);
      }

      const results = [];
      
      for (const item of contentLibrary || []) {
        try {
          // Check if embedding already exists
          const { data: existingEmbedding } = await supabase
            .from('content_embeddings')
            .select('id')
            .eq('content_id', item.id)
            .single();

          if (existingEmbedding) {
            console.log(`Embedding already exists for content ${item.id}`);
            continue;
          }

          // Generate embedding
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-ada-002',
              input: `${item.title || ''}\n\n${item.content}`.trim(),
            }),
          });

          if (!embeddingResponse.ok) {
            console.error(`Failed to generate embedding for ${item.id}`);
            continue;
          }

          const embeddingData = await embeddingResponse.json();
          const embedding = embeddingData.data[0].embedding;

          // Store embedding
          const { error: insertError } = await supabase
            .from('content_embeddings')
            .insert({
              content_id: item.id,
              content_text: `${item.title || ''}\n\n${item.content}`.trim(),
              content_type: item.content_type,
              topic_area: item.topic_area,
              keywords: item.keywords || [],
              embedding,
              metadata: {
                generated_at: new Date().toISOString(),
                model: 'text-embedding-ada-002'
              }
            });

          if (insertError) {
            console.error(`Failed to store embedding for ${item.id}:`, insertError);
            continue;
          }

          results.push({ content_id: item.id, status: 'success' });
          
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`Error processing content ${item.id}:`, error);
          results.push({ content_id: item.id, status: 'error', error: error.message });
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Error in content-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});