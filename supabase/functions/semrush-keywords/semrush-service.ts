
// Extract domain utility and SEMrush API service functions

export async function fetchSemrushKeywords(
  keyword: string, 
  limit: number, 
  domain: string,
  apiKey: string
): Promise<any> {
  let semrushUrl: string;
  
  if (keyword && keyword.trim()) {
    // Use phrase-related report for keyword-based searches to get related keywords
    semrushUrl = `https://api.semrush.com/?type=phrase_related&key=${apiKey}&phrase=${encodeURIComponent(keyword)}&database=us&export_columns=Ph,Nq,Cp,Kd&display_limit=${limit}`;
    console.log(`Using phrase_related report for keyword: "${keyword}"`);
  } else {
    // Use domain organic report for domain-only searches
    semrushUrl = `https://api.semrush.com/?type=domain_organic&key=${apiKey}&domain=${encodeURIComponent(domain)}&database=us&export_columns=Ph,Nq,Cp,Kd&display_limit=${limit}`;
    console.log(`Using domain_organic report for domain: "${domain}"`);
  }

  console.log(`Fetching from SEMrush API: ${semrushUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
  
  const response = await fetch(semrushUrl);
  const responseText = await response.text();
  
  console.log(`SEMrush API Response Status: ${response.status}`);
  console.log(`SEMrush API Response (first 200 chars): ${responseText.substring(0, 200)}`);

  if (!response.ok) {
    console.error(`SEMrush API error: ${response.status} - ${responseText}`);
    throw new Error(`SEMrush API request failed: ${response.status}`);
  }

  if (responseText.includes('ERROR')) {
    console.error(`SEMrush API returned error: ${responseText}`);
    throw new Error(`SEMrush API error: ${responseText}`);
  }

  return responseText;
}

export function processKeywords(csvData: string, cacheKey: string, topicArea: string = 'general'): any[] {
  const lines = csvData.trim().split('\n');
  console.log(`Processing ${lines.length} lines from SEMrush response`);
  
  if (lines.length <= 1) {
    console.log('No keyword data found in SEMrush response');
    return [];
  }

  const keywords: any[] = [];
  
  // Skip header row and process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const columns = line.split(';');
      
      if (columns.length >= 4) {
        const keyword = columns[0]?.replace(/"/g, '').trim();
        const volume = parseInt(columns[1]) || 0;
        const cpc = parseFloat(columns[2]) || 0;
        const difficulty = parseInt(columns[3]) || 50;
        
        if (keyword && keyword.length > 0) {
          keywords.push({
            keyword,
            volume,
            cpc: parseFloat(cpc.toFixed(2)),
            difficulty,
            trend: volume > 1000 ? 'up' : volume > 100 ? 'neutral' : 'down',
            cache_key: cacheKey,
            topic_area: topicArea
          });
        }
      }
    } catch (error) {
      console.error(`Error processing line ${i}: ${line}`, error);
      continue;
    }
  }
  
  console.log(`Successfully processed ${keywords.length} keywords`);
  return keywords;
}
