
import { useState } from 'react';
import { toast } from "sonner";
import { useN8nConfig } from './useN8nConfig';
import { useN8nResponseProcessor } from './useN8nResponseProcessor';
import { isAIContentSuggestionsFormat, formatAIContentSuggestions } from './useN8nAgent/aiContentFormatUtils';
import { resolveWebhookUrl } from './useN8nAgent/webhookUrlResolver';
import { N8nAgentPayload, N8nAgentResponse, N8nAgentState } from './useN8nAgent/types';

export const useN8nAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [contentTitle, setContentTitle] = useState<string>('');
  const [rawResponse, setRawResponse] = useState<any>(null);
  
  const { 
    getWebhookUrl, 
    getContentWebhookUrl, 
    getCustomKeywordsWebhookUrl,
    getContentAdjustmentWebhookUrl 
  } = useN8nConfig();
  const { processResponse } = useN8nResponseProcessor();

  const sendToN8n = async (
    payload: N8nAgentPayload, 
    webhookOption?: boolean | string,
    customWebhookUrl?: string
  ): Promise<N8nAgentResponse> => {
    setIsLoading(true);
    setError(null);
    setRawResponse(null);
    
    try {
      const webhookUrl = resolveWebhookUrl(
        payload, 
        webhookOption, 
        customWebhookUrl, 
        {
          getWebhookUrl,
          getContentWebhookUrl,
          getCustomKeywordsWebhookUrl,
          getContentAdjustmentWebhookUrl
        }
      );
      
      if (!webhookUrl) {
        throw new Error("No webhook URL configured. Please check API connections settings.");
      }

      console.log(`Using webhook URL for ${payload.requestType || 'default'}:`, webhookUrl);
      
      const defaultUrl = "https://www.officespacesoftware.com";
      const targetUrl = payload.targetUrl || defaultUrl;
      
      // If customPayload is provided, use that directly
      const finalPayload = payload.customPayload ? 
        payload.customPayload : 
        {
          ...payload,
          targetUrl,
          url: targetUrl
        };
      
      console.log("Sending data to webhook:", finalPayload);
      
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
        console.log("Raw webhook response:", responseText);
        
        // Store the raw response for debugging
        try {
          // Try to parse as JSON first
          const jsonResponse = JSON.parse(responseText);
          setRawResponse(jsonResponse);
          console.log("Parsed JSON response:", jsonResponse);
          
          // Direct handling for AI Content Suggestions format
          if (isAIContentSuggestionsFormat(jsonResponse)) {
            console.log("Detected AI Content Suggestions format directly");
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
          console.log("Response is not valid JSON, storing as string");
          setRawResponse(responseText);
        }
        
        // Process the response using the standard processor
        const result = processResponse(responseText);
        console.log("Processed response result:", result);
        
        // Update state with processed results
        if (result.content && result.content.length > 0) {
          setGeneratedContent(result.content);
          
          toast.success("Content Generated", {
            description: "Successfully received content from webhook"
          });
        } else {
          // If no content was processed, show an error
          console.log("No content processed from response");
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
      console.error("N8n webhook error:", err);
      
      toast.error("Webhook Error", {
        description: errorMessage
      });
      
      return { suggestions: [], content: [], title: '', error: errorMessage };
    } finally {
      setIsLoading(false);
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
