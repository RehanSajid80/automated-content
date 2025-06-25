
import { corsHeaders } from "./cors-config.ts"
import { getGlobalApiKey, getGlobalKeywordLimit } from "./config-manager.ts"
import { RequestData } from "./request-validator.ts"
import { fetchSemrushKeywords, processKeywords } from "./semrush-service.ts"
import { getExistingKeywords, deleteExistingKeywords, insertKeywords } from "./db-utils.ts"

export async function handleKeywordRequest(requestData: RequestData): Promise<Response> {
  const { searchKeyword, targetDomain, limit, topicArea } = requestData;

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
}
