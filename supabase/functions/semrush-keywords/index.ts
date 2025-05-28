
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
    // Parse request body - now expecting both keyword and domain
    const { keyword, domain, limit = 100, topicArea } = await req.json();
    console.log(`Request received for keyword: ${keyword}, domain: ${domain}, topic: ${topicArea}, limit: ${limit}`);

    if (!keyword) {
      throw new Error("Missing required parameter: keyword");
    }

    try {
      // Use domain if provided, otherwise use keyword as domain (backward compatibility)
      const targetDomain = domain ? extractDomain(domain) : extractDomain(keyword);
      console.log(`Using keyword: "${keyword}" for domain: ${targetDomain}, Topic Area: ${topicArea}`);
      
      // Check for API key
      const semrushApiKey = Deno.env.get('SEMRUSH_API_KEY');
      if (!semrushApiKey) {
        console.error('SEMrush API key is not configured');
        throw new Error('SEMrush API key is not configured');
      }
      
      console.log('SEMrush API key is configured and available');

      // Check for existing data first - use keyword + domain combination for caching
      const cacheKey = `${keyword}-${targetDomain}`;
      const existingKeywords = await getExistingKeywords(cacheKey, topicArea);
      if (existingKeywords && existingKeywords.length >= limit) {
        console.log(`Found ${existingKeywords.length} existing keywords for keyword: "${keyword}" and domain: ${targetDomain}`);
        
        return new Response(
          JSON.stringify({ 
            keywords: existingKeywords.slice(0, limit), // Respect the limit parameter
            remaining: 100 - existingKeywords.length,
            fromCache: true,
            apiKeyStatus: 'configured'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch and process new keywords from SEMrush using keyword research
      const parsedLimit = parseInt(String(limit), 10);
      const actualLimit = isNaN(parsedLimit) ? 100 : Math.max(30, Math.min(500, parsedLimit));
      console.log(`Fetching ${actualLimit} keywords from SEMrush API for keyword: "${keyword}" with key: ${semrushApiKey.substring(0, 8)}...`);
      
      const semrushResponse = await fetchSemrushKeywords(keyword, actualLimit, targetDomain);
      const allKeywords = processKeywords(semrushResponse, cacheKey, topicArea);

      if (allKeywords.length === 0) {
        console.log("No keywords returned from SEMrush API - this could indicate API key issues or no data for this keyword/domain combination");
        return new Response(
          JSON.stringify({ 
            keywords: [], 
            remaining: 100,
            error: `No keywords found for "${keyword}" related to ${targetDomain} - check API key or try different keywords`,
            apiKeyStatus: 'configured_but_no_data'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processed ${allKeywords.length} keywords from SEMrush`);

      // Clear existing data and insert new keywords using the cache key
      await deleteExistingKeywords(cacheKey, topicArea);
      const insertedKeywords = await insertKeywords(allKeywords);

      console.log(`Successfully inserted ${insertedKeywords.length} of ${allKeywords.length} keywords`);
      
      // Return all keywords from SEMrush (not just inserted ones)
      return new Response(
        JSON.stringify({ 
          keywords: allKeywords.slice(0, limit), // Return the full set up to the limit
          remaining: 100 - allKeywords.length,
          insertedCount: insertedKeywords.length,
          totalFetched: allKeywords.length,
          duplicatesIgnored: allKeywords.length - insertedKeywords.length,
          apiKeyStatus: 'working'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (domainError) {
      console.error('Domain validation error:', domainError);
      return new Response(
        JSON.stringify({ 
          error: domainError.message || 'Invalid domain format',
          apiKeyStatus: Deno.env.get('SEMRUSH_API_KEY') ? 'configured' : 'missing'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in semrush-keywords function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        apiKeyStatus: Deno.env.get('SEMRUSH_API_KEY') ? 'configured' : 'missing'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
