import { API_KEYS, getApiKey } from "./apiKeyUtils";

/**
 * Utility for tracking API call usage and throttling to prevent abuse and overspending
 * Uses localStorage to persist usage metrics and throttling settings
 */

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
