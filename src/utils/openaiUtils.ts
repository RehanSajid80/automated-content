
import { API_KEYS, getApiKey } from "./apiKeyUtils";
import { KeywordData } from "./excelUtils";
import { useToast } from "@/hooks/use-toast";

/**
 * Utility for tracking API call usage and throttling to prevent abuse and overspending
 * Uses localStorage to persist usage metrics and throttling settings
 */

// Define OpenAI models available for use
export const OPENAI_MODELS = {
  PREMIUM: 'gpt-4o',
  STANDARD: 'gpt-4o-mini',
  FALLBACK: 'gpt-3.5-turbo'
};

// Define the structure for API usage metrics
interface UsageMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  lastModelUsed: string;
}

// Define the structure for throttling settings
interface ThrottlingSettings {
  enabled: boolean;
  cooldownPeriod: number; // in seconds
}

// Function to initialize usage metrics in localStorage
const initializeUsageMetrics = (): UsageMetrics => {
  const initialMetrics: UsageMetrics = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    lastModelUsed: ""
  };
  localStorage.setItem('api-usage-metrics', JSON.stringify(initialMetrics));
  return initialMetrics;
};

// Function to get usage metrics from localStorage
export const getOpenAIUsageMetrics = (): UsageMetrics => {
  const storedMetrics = localStorage.getItem('api-usage-metrics');
  if (!storedMetrics) {
    return initializeUsageMetrics();
  }
  try {
    return JSON.parse(storedMetrics) as UsageMetrics;
  } catch (error) {
    console.error("Error parsing usage metrics from localStorage:", error);
    return initializeUsageMetrics();
  }
};

// Function to update usage metrics in localStorage
const updateOpenAIUsageMetrics = (success: boolean, modelUsed: string = "") => {
  const metrics = getOpenAIUsageMetrics();
  const updatedMetrics: UsageMetrics = {
    totalCalls: metrics.totalCalls + 1,
    successfulCalls: success ? metrics.successfulCalls + 1 : metrics.successfulCalls,
    failedCalls: success ? metrics.failedCalls : metrics.failedCalls + 1,
    lastModelUsed: modelUsed || metrics.lastModelUsed
  };
  localStorage.setItem('api-usage-metrics', JSON.stringify(updatedMetrics));
};

// Function to reset API call throttling
export const resetApiCallThrottling = () => {
  localStorage.removeItem('api-throttling-timestamp');
};

// Function to check if an API call is allowed based on throttling settings
export const isApiCallAllowed = (): boolean => {
  const throttlingSettings = getThrottlingSettings();
  if (!throttlingSettings.enabled) {
    return true; // Throttling is disabled, allow all calls
  }

  const lastCallTimestamp = localStorage.getItem('api-throttling-timestamp');
  if (!lastCallTimestamp) {
    // No previous API call, allow the current call
    localStorage.setItem('api-throttling-timestamp', Date.now().toString());
    return true;
  }

  const timeSinceLastCall = Date.now() - parseInt(lastCallTimestamp, 10);
  if (timeSinceLastCall >= throttlingSettings.cooldownPeriod * 1000) {
    // Cooldown period has passed, allow the call
    localStorage.setItem('api-throttling-timestamp', Date.now().toString());
    return true;
  }

  // API call is throttled
  return false;
};

// Function to get throttling settings from localStorage
const getThrottlingSettings = (): ThrottlingSettings => {
  const defaultSettings: ThrottlingSettings = {
    enabled: true,
    cooldownPeriod: 5 // in seconds
  };

  const storedSettings = localStorage.getItem('api-throttling-settings');
  if (!storedSettings) {
    return defaultSettings;
  }

  try {
    return JSON.parse(storedSettings) as ThrottlingSettings;
  } catch (error) {
    console.error("Error parsing throttling settings from localStorage:", error);
    return defaultSettings;
  }
};

// Example function to call the OpenAI API with usage tracking and throttling
export const callOpenAI = async (prompt: string, model: string, toast: any) => {
  if (!isApiCallAllowed()) {
    const throttlingSettings = getThrottlingSettings();
    const cooldownPeriod = throttlingSettings.cooldownPeriod;
    
    toast({
      title: "API Call Throttled",
      description: `Too many requests. Please wait ${cooldownPeriod} seconds before trying again.`,
      variant: "default"  // Changed from "warning" to "default"
    });
    
    return { success: false, data: null };
  }

  try {
    const apiKey = await getApiKey(API_KEYS.OPENAI);
    if (!apiKey) {
      toast({
        title: "OpenAI API Key Required",
        description: "Please set your OpenAI API key in the settings.",
        variant: "destructive",
      });
      return { success: false, data: null };
    }

    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      updateOpenAIUsageMetrics(false);
      toast({
        title: "OpenAI API Error",
        description: `Failed to generate content. Status: ${response.status}`,
        variant: "destructive",
      });
      return { success: false, data: null };
    }

    const data = await response.json();
    updateOpenAIUsageMetrics(true, model);
    return { success: true, data: data };
  } catch (error: any) {
    updateOpenAIUsageMetrics(false);
    toast({
      title: "OpenAI API Error",
      description: error.message || "Failed to generate content. Please check your API key and try again.",
      variant: "destructive",
    });
    return { success: false, data: null };
  }
};

// Content structure for generated suggestions
interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
}

/**
 * Generate content suggestions based on keywords analysis
 * @param keywords Array of keywords to analyze
 * @param toast Optional toast function for notifications
 * @param model OpenAI model to use (defaults to premium model)
 * @returns Array of content suggestions
 */
export const getContentSuggestions = async (
  keywords: KeywordData[],
  toast?: any,
  model: string = OPENAI_MODELS.PREMIUM
): Promise<ContentSuggestion[]> => {
  // Check if API call is allowed
  if (!isApiCallAllowed()) {
    const throttlingSettings = getThrottlingSettings();
    if (toast) {
      toast({
        title: "API Call Throttled",
        description: `Too many requests. Please wait ${throttlingSettings.cooldownPeriod} seconds before trying again.`,
        variant: "default"
      });
    }
    return [];
  }

  try {
    const apiKey = await getApiKey(API_KEYS.OPENAI);
    if (!apiKey) {
      if (toast) {
        toast({
          title: "OpenAI API Key Required",
          description: "Please set your OpenAI API key in the settings.",
          variant: "destructive",
        });
      }
      return [];
    }

    // Try the requested model first
    let selectedModel = model;
    
    // If the premium model is requested but fails, try falling back to standard
    try {
      const suggestionsResponse = await fetchContentSuggestions(keywords, apiKey, selectedModel);
      updateOpenAIUsageMetrics(true, selectedModel);
      return suggestionsResponse;
    } catch (error) {
      console.warn(`Error with model ${selectedModel}, falling back to ${OPENAI_MODELS.STANDARD}`, error);
      
      if (selectedModel === OPENAI_MODELS.PREMIUM) {
        selectedModel = OPENAI_MODELS.STANDARD;
        try {
          const suggestionsResponse = await fetchContentSuggestions(keywords, apiKey, selectedModel);
          updateOpenAIUsageMetrics(true, selectedModel);
          return suggestionsResponse;
        } catch (fallbackError) {
          console.warn(`Error with model ${selectedModel}, falling back to ${OPENAI_MODELS.FALLBACK}`, fallbackError);
          
          // Final fallback to the most basic model
          selectedModel = OPENAI_MODELS.FALLBACK;
          const suggestionsResponse = await fetchContentSuggestions(keywords, apiKey, selectedModel);
          updateOpenAIUsageMetrics(true, selectedModel);
          return suggestionsResponse;
        }
      } else {
        // If not using premium, fall back directly to the basic model
        selectedModel = OPENAI_MODELS.FALLBACK;
        const suggestionsResponse = await fetchContentSuggestions(keywords, apiKey, selectedModel);
        updateOpenAIUsageMetrics(true, selectedModel);
        return suggestionsResponse;
      }
    }
  } catch (error: any) {
    console.error("Error generating content suggestions:", error);
    updateOpenAIUsageMetrics(false);
    
    if (toast) {
      toast({
        title: "Content Generation Error",
        description: error.message || "Failed to generate content suggestions. Please check your API key and try again.",
        variant: "destructive",
      });
    }
    
    throw error; // Re-throw to allow handling by caller
  }
};

/**
 * Helper function to make the actual API call to OpenAI
 */
const fetchContentSuggestions = async (
  keywords: KeywordData[],
  apiKey: string,
  model: string
): Promise<ContentSuggestion[]> => {
  // Build prompt for OpenAI
  const keywordsText = keywords.map(k => 
    `"${k.keyword}" (search volume: ${k.volume || 'unknown'}, trend: ${k.trend || 'unknown'}, competitiveness: ${k.difficulty || 'unknown'})`
  ).join(", ");
  
  const prompt = `
    You are a content strategist for Office Space Software. Analyze these SEO keywords: ${keywordsText}.
    
    For each logical topic group in these keywords, suggest:
    1. A topic area name
    2. 2-3 pillar content ideas (in-depth articles/guides)
    3. 3-4 supporting page ideas (shorter, more specific content)
    4. 2-3 meta tag ideas for SEO
    5. 2-3 social media post ideas
    6. A brief reasoning for your suggestions
    
    Format your response as a JSON array where each object has the following structure exactly:
    {
      "topicArea": "Name of topic area",
      "pillarContent": ["Idea 1", "Idea 2"],
      "supportPages": ["Page 1", "Page 2", "Page 3"],
      "metaTags": ["Meta tag 1", "Meta tag 2"],
      "socialMedia": ["Social post 1", "Social post 2"],
      "reasoning": "Brief reasoning for suggestions"
    }
    
    IMPORTANT: Return ONLY the JSON array with no additional text, comments, or explanations.
  `;

  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides content strategy suggestions based on SEO keywords."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  // Parse JSON response while handling potential formatting issues
  try {
    // Attempt to extract JSON from the response in case it includes markdown code blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    // Clean the string to handle any unexpected characters
    const cleanJsonString = jsonString.replace(/^[\s\S]*?(\[[\s\S]*\])[\s\S]*$/, "$1").trim();
    
    return JSON.parse(cleanJsonString) as ContentSuggestion[];
  } catch (parseError) {
    console.error("Error parsing OpenAI response:", parseError, "Response:", content);
    throw new Error("Failed to parse content suggestions from OpenAI response");
  }
};
