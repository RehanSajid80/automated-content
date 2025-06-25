
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { corsHeaders } from "./cors-config.ts"
import { getGlobalApiKey, getGlobalKeywordLimit } from "./config-manager.ts"
import { validateRequest } from "./request-validator.ts"
import { handleKeywordRequest } from "./request-handler.ts"

// Main request handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate and parse request
    const requestData = await validateRequest(req);
    
    // Handle the keyword request
    return await handleKeywordRequest(requestData);
    
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
