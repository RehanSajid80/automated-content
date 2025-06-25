
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { extractDomain } from "./domain-utils.ts"
import { fetchSemrushKeywords, processKeywords } from "./semrush-service.ts"
import { getExistingKeywords, deleteExistingKeywords, insertKeywords } from "./db-utils.ts"

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for reading global API keys
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get global API key from database
async function getGlobalApiKey(keyName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('key_name', keyName)
      .is('user_id', null) // Global keys have null user_id
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching global API key:', error);
      return null;
    }
    
    if (!data) {
      console.log(`Global API key ${keyName} not found`);
      return null;
    }
    
    // Decrypt the key (simple base64 decoding)
    try {
      return atob(data.encrypted_key);
    } catch {
      // If decoding fails, return as-is (might not be encrypted)
      return data.encrypted_key;
    }
  } catch (error) {
    console.error('Error in getGlobalApiKey:', error);
    return null;
  }
}

// Function to get global keyword limit setting
async function getGlobalKeywordLimit(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('key_name', 'semrush-keyword-limit')
      .is('user_id', null)
      .eq('is_active', true)
      .maybeSingle();
    
    if (!error && data) {
      const limit = parseInt(data.encrypted_key, 10);
      return isNaN(limit) ? 100 : limit;
    }
  } catch (error) {
    console.error('Error fetching global keyword limit:', error);
  }
  
  return 100; // Default limit
}

// Main request handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body - now expecting keyword (required) and domain (optional)
    const { keyword, domain = '', limit = 100, topicArea } = await req.json();
    console.log(`Request received for keyword: ${keyword || '(none)'}, domain: ${domain || '(none)'}, topic: ${topicArea}, limit: ${limit}`);

    // Require either keyword or domain, but not both
    if (!keyword && !domain) {
      throw new Error("Either keyword or domain parameter is required");
    }

    try {
      const searchKeyword = keyword && keyword.trim() ? keyword.trim() : '';
      let targetDomain = '';
      
      // Only process domain if it's provided
      if (domain && domain.trim()) {
        targetDomain = extractDomain(domain.trim());
      }
      
      console.log(`Using ${searchKeyword ? `keyword: "${searchKeyword}" for related keyword research` : 'domain analysis for '}${targetDomain ? `domain: ${targetDomain}` : 'general search'}, Topic Area: ${topicArea}`);
      
      // Get SEMrush API key from global configuration
      console.log('Fetching SEMrush API key from global configuration...');
      const semrushApiKey = await getGlobalApiKey('semrush-api-key');
      
      if (!semrushApiKey) {
        console.error('SEMrush API key is not configured in global settings');
        return new Response(
          JSON.stringify({ 
            error: 'SEMrush API key is not configured in global settings. Please configure it in the API Connections page.',
            apiKeyStatus: 'missing'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log('SEMrush API key found in global configuration');

      // Get global keyword limit setting
      const globalKeywordLimit = await getGlobalKeywordLimit();
      console.log(`Using global keyword limit: ${globalKeywordLimit}`);

      // Create different cache keys for different search types
      let cacheKey: string;
      if (searchKeyword) {
        // Always use phrase-related for keyword searches to get related keywords
        cacheKey = `phrase-related-${searchKeyword}`;
      } else if (targetDomain) {
        cacheKey = `domain-${targetDomain}`;
      } else {
        cacheKey = `general-search`;
      }
      
      const existingKeywords = await getExistingKeywords(cacheKey, topicArea);
      if (existingKeywords && existingKeywords.length >= limit) {
        console.log(`Found ${existingKeywords.length} existing keywords for search: ${cacheKey}`);
        
        return new Response(
          JSON.stringify({ 
            keywords: existingKeywords.slice(0, limit), // Respect the limit parameter
            remaining: globalKeywordLimit - existingKeywords.length,
            fromCache: true,
            apiKeyStatus: 'configured'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch and process new keywords from SEMrush
      const parsedLimit = parseInt(String(limit), 10);
      const actualLimit = isNaN(parsedLimit) ? globalKeywordLimit : Math.max(30, Math.min(500, parsedLimit));
      console.log(`Fetching ${actualLimit} keywords from SEMrush API for search: ${cacheKey} with key: ${semrushApiKey.substring(0, 8)}...`);
      
      const semrushResponse = await fetchSemrushKeywords(searchKeyword, actualLimit, targetDomain, semrushApiKey);
      const allKeywords = processKeywords(semrushResponse, cacheKey, topicArea);

      if (allKeywords.length === 0) {
        const noDataMessage = searchKeyword 
          ? `No keywords found related to "${searchKeyword}". Try different or broader search terms.`
          : targetDomain 
            ? `No organic keywords found for ${targetDomain} - domain may not have sufficient organic visibility`
            : 'No keywords found for the search criteria';
        
        console.log("No keywords returned from SEMrush API - " + noDataMessage);
        return new Response(
          JSON.stringify({ 
            keywords: [], 
            remaining: globalKeywordLimit,
            error: noDataMessage,
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
          remaining: globalKeywordLimit - allKeywords.length,
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
          apiKeyStatus: 'configured'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in semrush-keywords function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        apiKeyStatus: 'missing'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
