
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

const isValidDomain = (domain: string): boolean => {
  // Basic domain validation - accept domain.com or subdomain.domain.com format
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, limit = 30 } = await req.json();
    console.log(`Request received for domain: ${keyword}, limit: ${limit}`);

    if (!keyword) {
      throw new Error("Missing required parameter: keyword");
    }

    // Clean domain for consistency
    const cleanDomain = keyword.replace(/^https?:\/\/(www\.)?/i, '');
    
    if (!isValidDomain(cleanDomain)) {
      return new Response(
        JSON.stringify({ 
          error: "Please enter a valid domain (e.g., example.com)"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check existing keywords for this domain
    const { data: existingKeywords, error: fetchError } = await supabaseAdmin
      .from('semrush_keywords')
      .select('*')
      .eq('domain', cleanDomain);

    if (fetchError) {
      console.error('Error fetching existing keywords:', fetchError);
      throw new Error('Failed to check for existing keywords');
    }

    if (existingKeywords && existingKeywords.length > 0) {
      console.log(`Found ${existingKeywords.length} existing keywords for domain: ${cleanDomain}`);
      return new Response(
        JSON.stringify({ 
          keywords: existingKeywords,
          remaining: 100 - existingKeywords.length,
          fromCache: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!semrushApiKey) {
      throw new Error('SEMrush API key is not configured');
    }

    // Fetch keywords from SEMrush API
    const semrushUrl = `https://api.semrush.com/management/v1/keywords?key=${semrushApiKey}&type=domain&query=${cleanDomain}&limit=${limit}`;
    console.log(`Calling SEMrush API for domain: ${cleanDomain}`);
    
    const semrushResponse = await fetch(semrushUrl);
    
    if (!semrushResponse.ok) {
      const errorText = await semrushResponse.text();
      console.error(`SEMrush API error (${semrushResponse.status}):`, errorText);
      throw new Error(`Failed to fetch keywords from SEMrush API: ${errorText}`);
    }

    const semrushData = await semrushResponse.json();
    
    if (!semrushData.keywords || !Array.isArray(semrushData.keywords)) {
      console.error('Invalid SEMrush response format:', semrushData);
      throw new Error('Invalid response format from SEMrush API');
    }

    const keywords = semrushData.keywords.map(kw => ({
      domain: cleanDomain,
      keyword: kw.keyword,
      volume: kw.volume,
      difficulty: kw.difficulty,
      cpc: kw.cpc,
      trend: kw.trend || 'neutral'
    }));

    // Store the keywords in the database
    if (keywords.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('semrush_keywords')
        .upsert(keywords);

      if (insertError) {
        console.error('Error storing keywords:', insertError);
        throw new Error('Failed to store keywords in database');
      }

      console.log(`Stored ${keywords.length} keywords for domain: ${cleanDomain}`);
    } else {
      console.log(`No keywords found for domain: ${cleanDomain}`);
    }
    
    return new Response(
      JSON.stringify({ 
        keywords,
        remaining: 100 - keywords.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in semrush-keywords function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
