
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
    // Parse request body
    const { keyword, limit = 100, topicArea } = await req.json();
    console.log(`Request received for domain: ${keyword}, topic: ${topicArea}, limit: ${limit}`);

    if (!keyword) {
      throw new Error("Missing required parameter: keyword");
    }

    try {
      // Extract and validate domain
      const cleanDomain = extractDomain(keyword);
      console.log(`Using domain for SEMrush API: ${cleanDomain}, Topic Area: ${topicArea}`);
      
      // Check for API key
      if (!Deno.env.get('SEMRUSH_API_KEY')) {
        throw new Error('SEMrush API key is not configured');
      }

      // Check for existing data first
      const existingKeywords = await getExistingKeywords(cleanDomain, topicArea);
      if (existingKeywords && existingKeywords.length >= limit) {
        console.log(`Found ${existingKeywords.length} existing keywords for domain: ${cleanDomain} and topic: ${topicArea}`);
        
        return new Response(
          JSON.stringify({ 
            keywords: existingKeywords.slice(0, limit), // Respect the limit parameter
            remaining: 100 - existingKeywords.length,
            fromCache: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch and process new keywords from SEMrush
      const parsedLimit = parseInt(String(limit), 10);
      const actualLimit = isNaN(parsedLimit) ? 100 : Math.max(30, Math.min(500, parsedLimit));
      console.log(`Fetching ${actualLimit} keywords from SEMrush API`);
      
      const semrushResponse = await fetchSemrushKeywords(cleanDomain, actualLimit);
      const allKeywords = processKeywords(semrushResponse, cleanDomain, topicArea);

      if (allKeywords.length === 0) {
        console.log("No keywords returned from SEMrush API");
        return new Response(
          JSON.stringify({ 
            keywords: [], 
            remaining: 100,
            error: "No keywords found for this domain"
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processed ${allKeywords.length} keywords from SEMrush`);

      // Clear existing data and insert new keywords
      await deleteExistingKeywords(cleanDomain, topicArea);
      const insertedKeywords = await insertKeywords(allKeywords);

      console.log(`Successfully inserted ${insertedKeywords.length} of ${allKeywords.length} keywords`);
      
      // Return all keywords from SEMrush (not just inserted ones)
      return new Response(
        JSON.stringify({ 
          keywords: allKeywords.slice(0, limit), // Return the full set up to the limit
          remaining: 100 - allKeywords.length,
          insertedCount: insertedKeywords.length,
          totalFetched: allKeywords.length
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
