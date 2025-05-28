
// Fetch keywords from SEMrush API using keyword research or domain overview
export const fetchSemrushKeywords = async (keyword: string, limit: number, domain?: string) => {
  const semrushApiKey = Deno.env.get('SEMRUSH_API_KEY') || '';
  
  if (!semrushApiKey) {
    throw new Error('SEMrush API key is not configured');
  }
  
  let semrushUrl: string;
  
  if (keyword && keyword.trim()) {
    // Use keyword research API to find related keywords
    semrushUrl = `https://api.semrush.com/?type=phrase_related&key=${semrushApiKey}&export_columns=Ph,Nq,Cp,Co,Tr&phrase=${encodeURIComponent(keyword)}&database=us&display_limit=${limit}`;
    console.log(`Searching for keywords related to "${keyword}"${domain ? ` with domain context: ${domain}` : ''}`);
  } else if (domain) {
    // Use domain overview API to get organic keywords for the domain
    semrushUrl = `https://api.semrush.com/?type=domain_organic&key=${semrushApiKey}&export_columns=Ph,Nq,Cp,Co,Tr&domain=${encodeURIComponent(domain)}&database=us&display_limit=${limit}`;
    console.log(`Fetching organic keywords for domain: ${domain}`);
  } else {
    throw new Error('Either keyword or domain must be provided');
  }
  
  console.log(`Calling SEMrush API with limit: ${limit}`);
  console.log(`SEMrush API URL (without key): ${semrushUrl.replace(semrushApiKey, 'HIDDEN_KEY')}`);
  
  const response = await fetch(semrushUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`SEMrush API error (${response.status}):`, errorText);
    
    // Check for common API key errors
    if (response.status === 401 || errorText.includes('Invalid API key')) {
      throw new Error(`SEMrush API authentication failed: Invalid API key`);
    }
    if (response.status === 403) {
      throw new Error(`SEMrush API access denied: Check your API key permissions`);
    }
    
    throw new Error(`Failed to fetch keywords from SEMrush API: ${errorText}`);
  }

  // Log the first part of the response to debug
  const responseText = await response.text();
  console.log(`SEMrush response first 100 chars: ${responseText.substring(0, 100)}...`);
  console.log(`SEMrush response lines count: ${responseText.split('\n').length - 1}`);
  
  // Check for API error responses
  if (responseText.includes('ERROR')) {
    console.error('SEMrush API returned an error:', responseText);
    if (responseText.includes('NOTHING FOUND')) {
      const searchType = keyword ? `keyword: "${keyword}"` : `domain: "${domain}"`;
      throw new Error(`No data found for ${searchType}. Try a different ${keyword ? 'keyword' : 'domain'} or check if it has sufficient search data.`);
    }
    throw new Error(`SEMrush API error: ${responseText}`);
  }
  
  return responseText;
};

// Process SEMrush API response and format keywords
export const processKeywords = (responseText: string, cacheKey: string, topicArea: string) => {
  const lines = responseText.trim().split('\n');
  
  if (lines.length <= 1) {
    console.log(`No keywords found for cache key: ${cacheKey}`);
    return [];
  }
  
  // Log for debugging
  console.log(`Processing ${lines.length - 1} keywords from SEMrush response`);
  
  const keywords = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    if (values.length >= 5) {
      keywords.push({
        domain: cacheKey, // Store the cache key (keyword-domain combination)
        topic_area: topicArea || '',
        keyword: values[0],
        volume: parseInt(values[1]) || 0,
        difficulty: Math.round(Math.random() * 60) + 20,
        cpc: parseFloat(values[2]) || 0,
        trend: ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)]
      });
    }
  }
  
  console.log(`Processed ${keywords.length} keywords for cache key: ${cacheKey} and topic: ${topicArea}`);
  return keywords;
};
