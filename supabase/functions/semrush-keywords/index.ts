
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SEMRUSH_API_KEY = Deno.env.get('SEMRUSH_API_KEY');
  if (!SEMRUSH_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'SEMrush API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { keyword, limit = 10 } = await req.json();

    // Check rate limits in the integrations table
    const { data: integration } = await supabaseAdmin
      .from('integrations')
      .select('config')
      .eq('type', 'semrush')
      .single();

    const now = new Date();
    const config = integration?.config || { 
      requests: 0, 
      lastReset: now.toISOString(),
      dailyLimit: 100 // Adjust based on your SEMrush plan
    };

    // Reset counter if it's a new day
    const lastReset = new Date(config.lastReset);
    if (lastReset.getUTCDate() !== now.getUTCDate()) {
      config.requests = 0;
      config.lastReset = now.toISOString();
    }

    // Check if we've hit the daily limit
    if (config.requests >= config.dailyLimit) {
      return new Response(
        JSON.stringify({ error: 'Daily API limit reached' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Make request to SEMrush API
    const response = await fetch(
      `https://api.semrush.com/analytics/v1/domain_organic/?type=domain&key=${SEMRUSH_API_KEY}&display_limit=${limit}&export_columns=Ph,Nq,Cp,Co,Tr&domain=${encodeURIComponent(keyword)}&database=us`
    );

    if (!response.ok) {
      throw new Error(`SEMrush API error: ${response.statusText}`);
    }

    const data = await response.text();
    const rows = data.split('\n').slice(1); // Skip header row
    const keywords = rows.map(row => {
      const [keyword, volume, difficulty, cpc, trend] = row.split(';');
      return {
        keyword,
        volume: parseInt(volume) || 0,
        difficulty: Math.round((parseInt(difficulty) || 0) * 100),
        cpc: parseFloat(cpc) || 0,
        trend: trend?.toLowerCase().includes('up') ? 'up' : 'neutral'
      };
    });

    // Update rate limit counter
    config.requests += 1;
    await supabaseAdmin
      .from('integrations')
      .upsert([{
        type: 'semrush',
        name: 'SEMrush API',
        config
      }]);

    return new Response(
      JSON.stringify({ keywords, remaining: config.dailyLimit - config.requests }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in semrush-keywords function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
