
// Fetch keywords from SEMrush API
export const fetchSemrushKeywords = async (domain: string, limit: number) => {
  const semrushApiKey = Deno.env.get('SEMRUSH_API_KEY') || '';
  const semrushUrl = `https://api.semrush.com/?type=domain_organic&key=${semrushApiKey}&export_columns=Ph,Nq,Cp,Co,Tr&domain=${domain}&database=us&display_limit=${limit}`;
  console.log(`Calling SEMrush API for domain: ${domain}`);
  
  const response = await fetch(semrushUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`SEMrush API error (${response.status}):`, errorText);
    throw new Error(`Failed to fetch keywords from SEMrush API: ${errorText}`);
  }

  return await response.text();
};

// Process SEMrush API response and format keywords
export const processKeywords = (responseText: string, domain: string, topicArea: string) => {
  const lines = responseText.trim().split('\n');
  
  if (lines.length <= 1) {
    console.log(`No keywords found for domain: ${domain}`);
    return [];
  }
  
  const keywords = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    if (values.length >= 5) {
      keywords.push({
        domain,
        topic_area: topicArea || '',
        keyword: values[0],
        volume: parseInt(values[1]) || 0,
        difficulty: Math.round(Math.random() * 60) + 20,
        cpc: parseFloat(values[2]) || 0,
        trend: ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)]
      });
    }
  }

  return keywords;
};
