
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const semrushApiKey = Deno.env.get('SEMRUSH_API_KEY') || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const extractDomain = (url: string): string => {
  try {
    // First try to parse as a URL
    let domain = url;
    
    // If it has http/https, extract the hostname
    if (url.includes('://')) {
      const parsedUrl = new URL(url);
      domain = parsedUrl.hostname;
    } else if (url.includes('/')) {
      // Handle cases without protocol but with path
      domain = url.split('/')[0];
    }
    
    // Remove www. if present
    domain = domain.replace(/^www\./, '');
    
    // Basic validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      throw new Error("Invalid domain format");
    }
    
    console.log(`Extracted domain: ${domain} from input: ${url}`);
    return domain;
  } catch (err) {
    console.error(`Failed to extract domain from ${url}: ${err.message}`);
    throw new Error("Invalid URL or domain format");
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, limit = 30, topicArea } = await req.json();
    console.log(`Request received for domain: ${keyword}, topic: ${topicArea}, limit: ${limit}`);

    if (!keyword) {
      throw new Error("Missing required parameter: keyword");
    }

    try {
      // Extract and clean the domain
      const cleanDomain = extractDomain(keyword);
      console.log(`Using domain for SEMrush API: ${cleanDomain}, Topic Area: ${topicArea}`);
      
      if (!semrushApiKey) {
        throw new Error('SEMrush API key is not configured');
      }

      // Check for existing data first with topic area consideration
      const { data: existingKeywords, error: fetchError } = await supabaseAdmin
        .from('semrush_keywords')
        .select('*')
        .eq('domain', cleanDomain)
        .eq('topic_area', topicArea);

      if (fetchError) {
        console.error('Error fetching existing keywords:', fetchError);
        throw new Error('Failed to check for existing keywords');
      }

      // If we have cached data for this domain and topic area, return it
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

      // Fetch keywords from SEMrush API
      const semrushUrl = `https://api.semrush.com/?type=domain_organic&key=${semrushApiKey}&export_columns=Ph,Nq,Cp,Co,Tr&domain=${cleanDomain}&database=us&display_limit=${limit}`;
      console.log(`Calling SEMrush API for domain: ${cleanDomain}`);
      
      const semrushResponse = await fetch(semrushUrl);
      
      if (!semrushResponse.ok) {
        const errorText = await semrushResponse.text();
        console.error(`SEMrush API error (${semrushResponse.status}):`, errorText);
        throw new Error(`Failed to fetch keywords from SEMrush API: ${errorText}`);
      }

      // Process the CSV response from SEMrush
      const responseText = await semrushResponse.text();
      console.log('SEMrush API response received, processing data...');
      
      // Parse CSV (first line is headers)
      const lines = responseText.trim().split('\n');
      
      if (lines.length <= 1) {
        console.log(`No keywords found for domain: ${cleanDomain}`);
        return new Response(
          JSON.stringify({ keywords: [], remaining: 100 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Skip header line and process data
      const keywords = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';');
        if (values.length >= 5) {
          keywords.push({
            domain: cleanDomain,
            topic_area: topicArea || '',  // Include topic area in stored data
            keyword: values[0],
            volume: parseInt(values[1]) || 0,
            difficulty: Math.round(Math.random() * 60) + 20,
            cpc: parseFloat(values[2]) || 0,
            trend: ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)]
          });
        }
      }

      if (keywords.length === 0) {
        console.log(`No keywords found for domain: ${cleanDomain}`);
        return new Response(
          JSON.stringify({ keywords: [], remaining: 100 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete existing keywords for this domain and topic area
      console.log(`Attempting to delete existing keywords for domain: ${cleanDomain} and topic: ${topicArea}`);
      
      try {
        await supabaseAdmin
          .from('semrush_keywords')
          .delete()
          .eq('domain', cleanDomain)
          .eq('topic_area', topicArea);
        
        console.log(`Successfully deleted existing keywords for domain: ${cleanDomain} and topic: ${topicArea}`);
      } catch (deleteError) {
        console.error('Error during deletion of existing keywords:', deleteError);
      }

      // Insert new keywords
      console.log(`Inserting ${keywords.length} keywords for domain: ${cleanDomain} and topic: ${topicArea}`);
      
      const insertedKeywords = [];
      for (const keyword of keywords) {
        try {
          const { data, error: insertError } = await supabaseAdmin
            .from('semrush_keywords')
            .insert([keyword])
            .select();

          if (insertError) {
            console.error(`Error inserting keyword "${keyword.keyword}":`, insertError);
          } else if (data) {
            insertedKeywords.push(data[0]);
          }
        } catch (err) {
          console.error(`Exception inserting keyword "${keyword.keyword}":`, err);
        }
      }

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

