import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, limit = 30 } = await req.json();
    console.log(`Request received for domain: ${keyword}, limit: ${limit}`);

    // Clean domain for consistency
    const cleanDomain = keyword.replace(/^https?:\/\/(www\.)?/i, '');

    // Check existing keywords for this domain
    const { data: existingKeywords, error: fetchError } = await supabaseAdmin
      .from('semrush_keywords')
      .select('*')
      .eq('domain', cleanDomain);

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

    // Generate mock data since we found no existing keywords
    const domainWords = cleanDomain.replace(/\.(com|org|net|io)$/, '').split(/[.-]/);
    const mockKeywords = [
      { keyword: `${domainWords[0]} software`, volume: 5400, difficulty: 78, cpc: 14.5, trend: "up" },
      { keyword: `${domainWords[0]} management system`, volume: 3800, difficulty: 65, cpc: 9.20, trend: "up" },
      { keyword: `${domainWords[0]} features`, volume: 6200, difficulty: 72, cpc: 12.75, trend: "up" },
      { keyword: `${domainWords[0]} alternatives`, volume: 7900, difficulty: 68, cpc: 11.50, trend: "up" },
      { keyword: `${domainWords[0]} pricing`, volume: 2900, difficulty: 54, cpc: 8.80, trend: "neutral" },
      { keyword: `${domainWords[0]} reviews`, volume: 4100, difficulty: 70, cpc: 13.25, trend: "up" },
      { keyword: `${domainWords[0]} vs competitor`, volume: 3200, difficulty: 62, cpc: 10.40, trend: "neutral" },
      { keyword: `${domainWords[0]} login`, volume: 2800, difficulty: 55, cpc: 9.60, trend: "up" },
      { keyword: `${domainWords[0]} app`, volume: 8500, difficulty: 85, cpc: 15.90, trend: "up" },
      { keyword: `${domainWords[0]} tutorial`, volume: 5600, difficulty: 67, cpc: 10.20, trend: "neutral" },
      { keyword: `${domainWords[0]} enterprise solution`, volume: 4200, difficulty: 75, cpc: 16.50, trend: "up" },
      { keyword: `${domainWords[0]} cloud platform`, volume: 6100, difficulty: 80, cpc: 15.75, trend: "up" },
      { keyword: `${domainWords[0]} integration`, volume: 3500, difficulty: 60, cpc: 11.30, trend: "neutral" },
      { keyword: `${domainWords[0]} api documentation`, volume: 2700, difficulty: 55, cpc: 9.80, trend: "up" },
      { keyword: `${domainWords[0]} deployment`, volume: 3900, difficulty: 68, cpc: 12.40, trend: "up" },
      { keyword: `${domainWords[0]} architecture`, volume: 2600, difficulty: 70, cpc: 13.60, trend: "neutral" },
      { keyword: `${domainWords[0]} performance`, volume: 5200, difficulty: 75, cpc: 14.25, trend: "up" },
      { keyword: `${domainWords[0]} security features`, volume: 4800, difficulty: 82, cpc: 16.90, trend: "up" },
      { keyword: `${domainWords[0]} customer support`, volume: 3300, difficulty: 58, cpc: 10.75, trend: "neutral" },
      { keyword: `${domainWords[0]} scalability`, volume: 4500, difficulty: 72, cpc: 13.80, trend: "up" }
    ];

    // Store the mock keywords in the database
    const { error: insertError } = await supabaseAdmin
      .from('semrush_keywords')
      .upsert(
        mockKeywords.map(kw => ({
          domain: cleanDomain,
          ...kw
        }))
      );

    if (insertError) {
      console.error('Error storing keywords:', insertError);
      throw new Error('Failed to store keywords in database');
    }

    console.log(`Stored ${mockKeywords.length} keywords for domain: ${cleanDomain}`);
    
    return new Response(
      JSON.stringify({ 
        keywords: mockKeywords,
        remaining: 100 - mockKeywords.length
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
