
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { extractDomain } from "./domain-utils.ts"
import { fetchSemrushKeywords, processKeywords } from "./semrush-service.ts"
import { getExistingKeywords, deleteExistingKeywords, insertKeywords } from "./db-utils.ts"

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main request handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, limit = 100, topicArea } = await req.json();
    console.log(`Request received for domain: ${keyword}, topic: ${topicArea}, limit: ${limit}`);

    if (!keyword) {
      throw new Error("Missing required parameter: keyword");
    }

    try {
      const cleanDomain = extractDomain(keyword);
      console.log(`Using domain for SEMrush API: ${cleanDomain}, Topic Area: ${topicArea}`);
      
      if (!Deno.env.get('SEMRUSH_API_KEY')) {
        throw new Error('SEMrush API key is not configured');
      }

      // Check for existing data
      const existingKeywords = await getExistingKeywords(cleanDomain, topicArea);
      if (existingKeywords && existingKeywords.length > 0) {
        console.log(`Found ${existingKeywords.length} existing keywords for domain: ${cleanDomain} and topic: ${topicArea}`);
        return new Response(
          JSON.stringify({ 
            keywords: existingKeywords,
            remaining: 100 - existingKeywords.length,
            fromCache: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch and process new keywords
      const semrushResponse = await fetchSemrushKeywords(cleanDomain, limit);
      const keywords = processKeywords(semrushResponse, cleanDomain, topicArea);

      if (keywords.length === 0) {
        return new Response(
          JSON.stringify({ keywords: [], remaining: 100 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update database
      await deleteExistingKeywords(cleanDomain, topicArea);
      const insertedKeywords = await insertKeywords(keywords);

      console.log(`Successfully inserted ${insertedKeywords.length} of ${keywords.length} keywords`);
      
      return new Response(
        JSON.stringify({ 
          keywords: insertedKeywords.length > 0 ? insertedKeywords : keywords,
          remaining: 100 - keywords.length,
          insertedCount: insertedKeywords.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (domainError) {
      console.error('Domain validation error:', domainError);
      return new Response(
        JSON.stringify({ error: domainError.message || 'Invalid domain format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in semrush-keywords function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
