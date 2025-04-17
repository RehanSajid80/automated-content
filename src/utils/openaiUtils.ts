
import { KeywordData } from "./excelUtils";
import { toast } from "@/hooks/use-toast";
import { getApiKey, API_KEYS } from "./apiKeyUtils";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
}

// Define available models in order of preference and cost
export const OPENAI_MODELS = {
  PREMIUM: "gpt-4o",
  STANDARD: "gpt-4o-mini",
  FALLBACK: "gpt-3.5-turbo" // Ultimate fallback if needed
};

// API call tracking to prevent multiple rapid calls
const apiCallTracker = {
  lastCallTime: 0,
  cooldownPeriod: 5000, // 5 seconds cooldown
  inProgress: false,
  validateThrottling: function() {
    const now = Date.now();
    if (this.inProgress) {
      return { allowed: false, reason: "A request is already in progress" };
    }
    if (now - this.lastCallTime < this.cooldownPeriod) {
      return { 
        allowed: false, 
        reason: `Please wait ${Math.ceil((this.cooldownPeriod - (now - this.lastCallTime)) / 1000)} seconds before making another request` 
      };
    }
    return { allowed: true };
  },
  startCall: function() {
    this.inProgress = true;
  },
  endCall: function() {
    this.lastCallTime = Date.now();
    this.inProgress = false;
  }
};

// Quality assessment for content suggestions
const contentQualityCheck = {
  validateSuggestions: function(suggestions: ContentSuggestion[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return { valid: false, issues: ["No content suggestions were generated"] };
    }
    
    for (let i = 0; i < suggestions.length; i++) {
      const suggestion = suggestions[i];
      
      // Check for missing required fields
      if (!suggestion.topicArea) {
        issues.push(`Suggestion #${i+1} is missing a topic area`);
      }
      
      // Check for empty content arrays
      if (!suggestion.pillarContent || suggestion.pillarContent.length === 0) {
        issues.push(`Suggestion #${i+1} has no pillar content ideas`);
      }
      
      if (!suggestion.supportPages || suggestion.supportPages.length === 0) {
        issues.push(`Suggestion #${i+1} has no support page ideas`);
      }
      
      // Check content length and quality
      suggestion.pillarContent?.forEach((content, idx) => {
        if (content.length < 10) {
          issues.push(`Pillar content #${idx+1} in suggestion #${i+1} is too short`);
        }
      });
    }
    
    return { valid: issues.length === 0, issues };
  }
};

// Track usage metrics
const usageMetrics = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  lastModelUsed: "",
  
  recordCall: function(success: boolean, model: string) {
    this.totalCalls++;
    if (success) {
      this.successfulCalls++;
    } else {
      this.failedCalls++;
    }
    this.lastModelUsed = model;
    
    try {
      // Store metrics in localStorage for the API connections dashboard
      localStorage.setItem('openai-usage-metrics', JSON.stringify({
        totalCalls: this.totalCalls,
        successfulCalls: this.successfulCalls,
        failedCalls: this.failedCalls,
        lastModelUsed: this.lastModelUsed,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.warn("Failed to save metrics:", err);
    }
  },
  
  getMetrics: function() {
    try {
      const stored = localStorage.getItem('openai-usage-metrics');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.assign(this, parsed);
      }
    } catch (err) {
      console.warn("Failed to load metrics:", err);
    }
    
    return {
      totalCalls: this.totalCalls,
      successfulCalls: this.successfulCalls,
      failedCalls: this.failedCalls,
      lastModelUsed: this.lastModelUsed
    };
  }
};

export async function getContentSuggestions(
  keywords: KeywordData[],
  customApiKey?: string,
  model: string = OPENAI_MODELS.PREMIUM
): Promise<ContentSuggestion[]> {
  try {
    // Check if we're throttling requests
    const throttleCheck = apiCallTracker.validateThrottling();
    if (!throttleCheck.allowed) {
      toast({
        title: "Request Throttled",
        description: throttleCheck.reason,
        variant: "destructive",
      });
      throw new Error(throttleCheck.reason);
    }
    
    // Mark call as in progress
    apiCallTracker.startCall();
    
    // Use provided API key or get from storage
    const apiKey = customApiKey || await getApiKey(API_KEYS.OPENAI);
    
    if (!apiKey) {
      apiCallTracker.endCall(); // Release lock
      throw new Error("No OpenAI API key provided");
    }

    // Prepare the data for OpenAI
    const keywordData = keywords.map((kw) => ({
      keyword: kw.keyword,
      volume: kw.volume,
      difficulty: kw.difficulty,
      cpc: kw.cpc,
      trend: kw.trend,
    }));

    // Check if this is a custom n8n AI agent key
    // Custom n8n keys start with "n8n-agent-"
    if (customApiKey && customApiKey.startsWith("n8n-agent-")) {
      try {
        const result = await getContentSuggestionsFromN8n(keywordData, customApiKey);
        apiCallTracker.endCall(); // Release lock
        usageMetrics.recordCall(true, "n8n-agent");
        return result;
      } catch (error) {
        apiCallTracker.endCall(); // Release lock
        usageMetrics.recordCall(false, "n8n-agent");
        throw error;
      }
    }

    // Get previous content suggestions from localStorage if available
    let previousSuggestions = [];
    try {
      const savedSuggestions = localStorage.getItem('previous-content-suggestions');
      if (savedSuggestions) {
        previousSuggestions = JSON.parse(savedSuggestions);
      }
    } catch (err) {
      console.warn("Failed to load previous suggestions:", err);
    }

    // Create the prompt for OpenAI
    const prompt = `
      I have the following keyword data for office space management content:
      ${JSON.stringify(keywordData, null, 2)}

      Based on this data, suggest 3-5 topic areas for content creation. 
      For each topic area, recommend:
      1. Pillar content ideas (comprehensive guides)
      2. Support page ideas (specific aspects of the topic)
      3. Meta tag suggestions (for SEO)
      4. Social media post ideas

      Prioritize keywords with higher volume, upward trends, and reasonable difficulty.
      ${previousSuggestions.length > 0 ? `
      
      Here are previous content suggestions that performed well:
      ${JSON.stringify(previousSuggestions.slice(0, 3), null, 2)}
      Consider these as examples of successful topics, but provide fresh ideas tailored to the current keywords.
      ` : ''}

      Format your response as a JSON array where each object has:
      { 
        "topicArea": "Topic name", 
        "pillarContent": ["idea1", "idea2"], 
        "supportPages": ["idea1", "idea2"],
        "metaTags": ["tag1", "tag2"],
        "socialMedia": ["post idea1", "post idea2"],
        "reasoning": "Brief explanation of why this topic was chosen"
      }
    `;

    // Make the API call to OpenAI
    toast({
      title: "Generating Content Suggestions",
      description: `Using ${model} model to analyze ${keywords.length} keywords...`,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,  // Use the passed model
        messages: [
          {
            role: "system",
            content: "You are a content strategy expert specializing in SEO and office space management.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || `API error (${response.status})`;
      
      // Check for common API key issues
      if (response.status === 401) {
        apiCallTracker.endCall(); // Release lock
        usageMetrics.recordCall(false, model);
        throw new Error("Invalid API key. Please check your OpenAI API key and try again.");
      } else if (response.status === 429) {
        // More specific rate limit error handling
        const retryAfter = response.headers.get("retry-after");
        const waitTime = retryAfter ? parseInt(retryAfter) : 60;
        const waitMinutes = Math.ceil(waitTime / 60);
        
        console.warn(`Rate limited on model: ${model}`);
        
        // Implement cascading model fallback
        if (model === OPENAI_MODELS.PREMIUM) {
          // First fallback: try the standard model
          console.warn(`Rate limited on ${OPENAI_MODELS.PREMIUM}, falling back to ${OPENAI_MODELS.STANDARD}`);
          apiCallTracker.endCall(); // Release lock
          usageMetrics.recordCall(false, model);
          return getContentSuggestions(keywords, customApiKey, OPENAI_MODELS.STANDARD);
        } else if (model === OPENAI_MODELS.STANDARD) {
          // Second fallback: try the ultimate fallback model
          console.warn(`Rate limited on ${OPENAI_MODELS.STANDARD}, falling back to ${OPENAI_MODELS.FALLBACK}`);
          apiCallTracker.endCall(); // Release lock
          usageMetrics.recordCall(false, model);
          return getContentSuggestions(keywords, customApiKey, OPENAI_MODELS.FALLBACK);
        }
        
        // If we're already on the lowest tier model or other models also failed
        apiCallTracker.endCall(); // Release lock
        usageMetrics.recordCall(false, model);
        throw new Error(
          `Rate limit exceeded. Your OpenAI account has reached its request limit. ` + 
          `Current balance might be low. ` +
          `Please wait approximately ${waitMinutes} ${waitMinutes === 1 ? 'minute' : 'minutes'} before trying again, ` +
          `or check your usage at https://platform.openai.com/account/usage.`
        );
      } else {
        apiCallTracker.endCall(); // Release lock
        usageMetrics.recordCall(false, model);
        throw new Error(errorMessage);
      }
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      apiCallTracker.endCall(); // Release lock
      usageMetrics.recordCall(false, model);
      throw new Error("No content returned from OpenAI");
    }

    // Extract the JSON from the response
    // The response might contain markdown or other formatting
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/```\n([\s\S]*?)\n```/) || 
                      [null, content];
    
    const jsonString = jsonMatch[1] || content;
    
    try {
      const suggestions = JSON.parse(jsonString);
      const suggestionArray = Array.isArray(suggestions) ? suggestions : [suggestions];
      
      // Perform quality validation
      const qualityCheck = contentQualityCheck.validateSuggestions(suggestionArray);
      if (!qualityCheck.valid) {
        console.warn("Content quality issues detected:", qualityCheck.issues);
        toast({
          title: "Content Quality Issues",
          description: qualityCheck.issues[0],
          variant: "warning",
        });
      }
      
      // Store the new suggestions for future learning
      try {
        // Combine with previous suggestions, keeping the most recent ones first
        const allSuggestions = [...suggestionArray, ...previousSuggestions].slice(0, 10);
        localStorage.setItem('previous-content-suggestions', JSON.stringify(allSuggestions));
      } catch (err) {
        console.warn("Failed to save suggestions for learning:", err);
      }
      
      // End tracking and record usage
      apiCallTracker.endCall();
      usageMetrics.recordCall(true, model);
      
      return suggestionArray;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      apiCallTracker.endCall(); // Release lock
      usageMetrics.recordCall(false, model);
      throw new Error("Failed to parse content suggestions from OpenAI");
    }
  } catch (error) {
    console.error("Error getting content suggestions:", error);
    // Make sure to release the lock if there's an error
    if (apiCallTracker.inProgress) {
      apiCallTracker.endCall();
    }
    
    toast({
      title: "OpenAI Error",
      description: error instanceof Error ? error.message : "Failed to get content suggestions",
      variant: "destructive",
    });
    throw error;
  }
}

// Function to handle n8n AI agent requests
async function getContentSuggestionsFromN8n(
  keywordData: any[],
  agentKey: string
): Promise<ContentSuggestion[]> {
  try {
    // Get the agent details from storage
    const agentInfo = JSON.parse(localStorage.getItem(agentKey) || "{}");
    
    if (!agentInfo || !agentInfo.metadata || !agentInfo.metadata.url) {
      throw new Error("Invalid n8n AI agent configuration");
    }
    
    const agentUrl = agentInfo.metadata.url;
    const agentApiKey = agentInfo.key;
    
    console.log(`Using n8n AI agent at ${agentUrl}`);
    
    // Make the request to the n8n agent
    const response = await fetch(agentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(agentApiKey ? { "Authorization": `Bearer ${agentApiKey}` } : {})
      },
      body: JSON.stringify({
        keywords: keywordData,
        action: "generateContentSuggestions",
        format: "json"
      }),
    });
    
    if (!response.ok) {
      throw new Error(`n8n AI agent error: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    // Ensure the response is in the expected format
    if (!data || !Array.isArray(data.suggestions)) {
      throw new Error("Invalid response format from n8n AI agent");
    }
    
    // Map the response to match our ContentSuggestion interface
    return data.suggestions.map((suggestion: any) => ({
      topicArea: suggestion.topicArea || suggestion.topic || "",
      pillarContent: Array.isArray(suggestion.pillarContent) ? suggestion.pillarContent : [],
      supportPages: Array.isArray(suggestion.supportPages) ? suggestion.supportPages : [],
      metaTags: Array.isArray(suggestion.metaTags) ? suggestion.metaTags : [],
      socialMedia: Array.isArray(suggestion.socialMedia) ? suggestion.socialMedia : [],
      reasoning: suggestion.reasoning || ""
    }));
  } catch (error) {
    console.error("Error getting content suggestions from n8n:", error);
    toast({
      title: "n8n AI Agent Error",
      description: error instanceof Error ? error.message : "Failed to get content suggestions from n8n",
      variant: "destructive",
    });
    throw error;
  }
}

// Export the utility functions for usage in the API connections page
export const getOpenAIUsageMetrics = () => {
  return usageMetrics.getMetrics();
};

// Reset the API call throttling (for testing or admin purposes)
export const resetApiCallThrottling = () => {
  apiCallTracker.inProgress = false;
  apiCallTracker.lastCallTime = 0;
};
