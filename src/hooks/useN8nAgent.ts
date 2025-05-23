
import { useState } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { toast } from "sonner";
import { useN8nConfig } from './useN8nConfig';
import { useN8nResponseProcessor } from './useN8nResponseProcessor';

interface N8nAgentPayload {
  keywords?: KeywordData[];
  topicArea?: string;
  targetUrl?: string;
  url?: string;
  requestType?: 'contentSuggestions' | 'keywordAnalysis' | 'customKeywords';
  contentType?: string;
  chatHistory?: any[];
  currentInstruction?: string;
  currentImageUrl?: string;
  customPayload?: any;
  output_format?: any;
  customKeywords?: string[];
}

export const useN8nAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [contentTitle, setContentTitle] = useState<string>('');
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  const { getWebhookUrl, getContentWebhookUrl, getCustomKeywordsWebhookUrl } = useN8nConfig();
  const { processResponse } = useN8nResponseProcessor();

  // Modified to only use AI Content Suggestions webhook for testing
  const sendToN8n = async (
    payload: any, 
    webhookOption?: boolean | string,
    customWebhookUrl?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setRawResponse(null);
    
    try {
      // ALWAYS use the custom keywords webhook (AI Content Suggestions) for testing
      const customKeywordsWebhook = getCustomKeywordsWebhookUrl();
      let webhookUrl = customKeywordsWebhook;
      
      if (!webhookUrl) {
        throw new Error("No AI Content Suggestions webhook URL configured. Please check API connections settings.");
      }

      console.log(`TESTING - Using AI Content Suggestions webhook URL:`, webhookUrl);
      
      const defaultUrl = "https://www.officespacesoftware.com";
      const targetUrl = payload.targetUrl || defaultUrl;
      
      // If customPayload is provided, use that directly
      const finalPayload = payload.customPayload ? 
        payload.customPayload : 
        {
          ...payload,
          targetUrl,
          url: targetUrl,
          // Always force requestType to customKeywords for testing
          requestType: 'customKeywords'
        };
      
      console.log("Sending data to AI Content Suggestions webhook:", finalPayload);
      
      const controller = new AbortController();
      // Increase timeout to 180 seconds (3 minutes)
      const timeoutId = setTimeout(() => controller.abort(), 180000);
      
      try {
        // This is the actual HTTP request sent to the webhook
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...finalPayload,
            source: "lovable",
            timestamp: new Date().toISOString()
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const responseText = await response.text();
          console.log("Error response text:", responseText);
          throw new Error(`HTTP error! status: ${response.status}. ${responseText || ''}`);
        }
        
        const responseText = await response.text();
        console.log("TESTING - Raw webhook response:", responseText);
        
        // Store the raw response for debugging
        try {
          // Try to parse as JSON first
          const jsonResponse = JSON.parse(responseText);
          setRawResponse(jsonResponse);
          console.log("TESTING - Parsed JSON response:", jsonResponse);
          
          // Direct handling for AI Content Suggestions format
          if (isAIContentSuggestionsFormat(jsonResponse)) {
            console.log("TESTING - Detected AI Content Suggestions format directly");
            const formattedContent = formatAIContentSuggestions(jsonResponse);
            setGeneratedContent(formattedContent);
            toast.success("Content Generated", {
              description: "Successfully received AI content suggestions"
            });
            
            return {
              suggestions: [],
              content: formattedContent,
              title: Array.isArray(jsonResponse) && jsonResponse[0]?.title || '',
              rawResponse: jsonResponse
            };
          }
        } catch (e) {
          // If it's not valid JSON, store as string
          console.log("TESTING - Response is not valid JSON, storing as string");
          setRawResponse(responseText);
        }
        
        // Process the response using the standard processor
        const result = processResponse(responseText);
        console.log("TESTING - Processed response result:", result);
        
        // Update state with processed results
        if (result.content && result.content.length > 0) {
          setGeneratedContent(result.content);
          
          toast.success("Content Generated", {
            description: "Successfully received content from webhook"
          });
        } else {
          // If no content was processed, show an error
          console.log("TESTING - No content processed from response");
          toast.error("Processing Error", {
            description: "Received a response but couldn't extract content"
          });
        }
        
        if (result.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions);
        }
        
        if (result.title) {
          setContentTitle(result.title);
        }
        
        return {
          suggestions: result.suggestions || [],
          content: result.content || [],
          title: result.title || '',
          rawResponse: responseText
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Webhook request timed out after 180 seconds');
        }
        
        throw fetchError;
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to communicate with n8n webhook";
      setError(errorMessage);
      console.error("TESTING - N8n webhook error:", err);
      
      toast.error("Webhook Error", {
        description: errorMessage
      });
      
      return { suggestions: [], content: [], title: '', error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to check if the response is in AI Content Suggestions format
  const isAIContentSuggestionsFormat = (data: any): boolean => {
    if (!data) return false;
    
    console.log("TESTING - Checking if response is in AI Content Suggestions format", data);
    
    // Check array format
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      return Boolean(firstItem && 
        (firstItem.pillarContent || firstItem.supportContent || 
         firstItem.socialMediaPosts || firstItem.emailSeries));
    }
    
    // Check single object format
    return Boolean(data && 
      (data.pillarContent || data.supportContent || 
       data.socialMediaPosts || data.emailSeries));
  };
  
  // Helper function to format AI Content Suggestions consistently
  const formatAIContentSuggestions = (data: any): any[] => {
    console.log("TESTING - Formatting AI Content Suggestions", data);
    
    if (Array.isArray(data)) {
      return data.map(item => ({
        topicArea: item.title || item.topicArea || "Content Suggestions",
        pillarContent: typeof item.pillarContent === 'string' ? [item.pillarContent] : item.pillarContent || [],
        supportContent: typeof item.supportContent === 'string' ? [item.supportContent] : item.supportContent || [],
        supportPages: typeof item.supportContent === 'string' ? [item.supportContent] : item.supportContent || [],
        metaTags: item.metaTags || [],
        socialMedia: item.socialMediaPosts || [],
        socialMediaPosts: item.socialMediaPosts || [],
        email: item.emailSeries ? 
          item.emailSeries.map((email: any) => 
            `Subject: ${email.subject}\n\n${email.body}`
          ) : [],
        emailSeries: item.emailSeries || [],
        reasoning: item.reasoning || null
      }));
    } else {
      return [{
        topicArea: data.title || data.topicArea || "Content Suggestions",
        pillarContent: typeof data.pillarContent === 'string' ? [data.pillarContent] : data.pillarContent || [],
        supportContent: typeof data.supportContent === 'string' ? [data.supportContent] : data.supportContent || [],
        supportPages: typeof data.supportContent === 'string' ? [data.supportContent] : data.supportContent || [],
        metaTags: data.metaTags || [],
        socialMedia: data.socialMediaPosts || [],
        socialMediaPosts: data.socialMediaPosts || [],
        email: data.emailSeries ? 
          data.emailSeries.map((email: any) => 
            `Subject: ${email.subject}\n\n${email.body}`
          ) : [],
        emailSeries: data.emailSeries || [],
        reasoning: data.reasoning || null
      }];
    }
  };
  
  return {
    isLoading,
    error,
    suggestions,
    generatedContent,
    contentTitle,
    rawResponse,
    sendToN8n,
    setGeneratedContent,
    setContentTitle
  };
};
