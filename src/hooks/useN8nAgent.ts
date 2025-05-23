
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

  /**
   * Sends data to the n8n webhook
   * @param payload The payload to send
   * @param webhookOption Can be: 
   *   - boolean (true to use content webhook, false to use keyword webhook)
   *   - string (direct webhook URL to use)
   * @param customWebhookUrl Optional direct webhook URL (deprecated, use webhookOption instead)
   */
  const sendToN8n = async (
    payload: any, 
    webhookOption?: boolean | string,
    customWebhookUrl?: string
  ) => {
    setIsLoading(true);
    setError(null);
    setRawResponse(null);
    
    try {
      // Determine which webhook URL to use
      let webhookUrl: string;
      
      if (typeof webhookOption === 'string') {
        // Direct webhook URL provided
        webhookUrl = webhookOption;
      } else if (typeof webhookOption === 'boolean') {
        // Boolean flag (true = content webhook, false = keyword webhook)
        webhookUrl = webhookOption ? getContentWebhookUrl() : getWebhookUrl();
      } else if (customWebhookUrl) {
        // Legacy support for customWebhookUrl parameter
        webhookUrl = customWebhookUrl;
      } else {
        // Default to keyword webhook
        webhookUrl = getWebhookUrl();
      }
      
      // Check if this is a custom keywords request (now called AI Content Suggestions)
      if (payload.requestType === 'customKeywords' || (payload.customPayload && payload.customPayload.custom_keywords)) {
        const customKeywordsWebhook = getCustomKeywordsWebhookUrl();
        if (customKeywordsWebhook) {
          webhookUrl = customKeywordsWebhook;
          console.log("Using AI Content Suggestions webhook:", webhookUrl);
        }
      }
      
      if (!webhookUrl) {
        throw new Error("No webhook URL configured. Please check API connections settings.");
      }

      console.log(`Using webhook URL:`, webhookUrl);
      
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
      
      console.log("Sending data to n8n webhook:", finalPayload);
      
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
        console.log("Raw webhook response:", responseText.substring(0, 300) + "...");
        setRawResponse(responseText);
        
        // Direct processing for AI Content Suggestions format
        try {
          let directParsingSuccessful = false;
          let parsedResponse = JSON.parse(responseText);
          
          // Handle empty array case
          if (Array.isArray(parsedResponse) && parsedResponse.length === 0) {
            console.log("Received an empty array response");
            setGeneratedContent([]);
            
            toast.error("Empty Response", {
              description: "The content generation API returned an empty response. Please try again."
            });
            
            return {
              suggestions: [],
              content: [],
              title: '',
              rawResponse: responseText
            };
          }
          
          // Check if it's an array or single object with the expected properties
          if (Array.isArray(parsedResponse) && parsedResponse.length > 0) {
            console.log("Examining array response of length:", parsedResponse.length);
            
            // Check the first item for expected format
            const firstItem = parsedResponse[0];
            if (firstItem && 
               (firstItem.pillarContent || firstItem.supportContent || 
                firstItem.socialMediaPosts || firstItem.emailSeries)) {
              console.log("Detected AI Content Suggestions array format");
              
              const processedContent = parsedResponse.map(item => ({
                topicArea: item.title || payload.topicArea || "Content Suggestions",
                pillarContent: typeof item.pillarContent === 'string' ? [item.pillarContent] : item.pillarContent || [],
                supportPages: typeof item.supportContent === 'string' ? [item.supportContent] : item.supportContent || [],
                metaTags: [],
                socialMedia: item.socialMediaPosts || [],
                email: item.emailSeries ? 
                  item.emailSeries.map((email: any) => 
                    `Subject: ${email.subject}\n\n${email.body}`
                  ) : [],
                reasoning: item.reasoning || null
              }));
              
              setGeneratedContent(processedContent);
              directParsingSuccessful = true;
              
              toast.success("Content Generated", {
                description: "Successfully received AI content suggestions"
              });
              
              return {
                suggestions: [],
                content: processedContent,
                title: '',
                rawResponse: responseText
              };
            } else {
              console.log("Array response doesn't match expected AI Content Suggestions format");
            }
          }
          // Try single object format
          else if (parsedResponse && 
                 (parsedResponse.pillarContent || 
                  parsedResponse.supportContent || 
                  parsedResponse.socialMediaPosts || 
                  parsedResponse.emailSeries)) {
            console.log("Detected AI Content Suggestions single object format");
            
            const processedContent = [{
              topicArea: parsedResponse.title || payload.topicArea || "Content Suggestions",
              pillarContent: typeof parsedResponse.pillarContent === 'string' ? [parsedResponse.pillarContent] : parsedResponse.pillarContent || [],
              supportPages: typeof parsedResponse.supportContent === 'string' ? [parsedResponse.supportContent] : parsedResponse.supportContent || [],
              metaTags: [],
              socialMedia: parsedResponse.socialMediaPosts || [],
              email: parsedResponse.emailSeries ? 
                parsedResponse.emailSeries.map((email: any) => 
                  `Subject: ${email.subject}\n\n${email.body}`
                ) : [],
              reasoning: parsedResponse.reasoning || null
            }];
            
            setGeneratedContent(processedContent);
            directParsingSuccessful = true;
            
            toast.success("Content Generated", {
              description: "Successfully received AI content suggestions"
            });
            
            return {
              suggestions: [],
              content: processedContent,
              title: parsedResponse.title || '',
              rawResponse: responseText
            };
          }
          
          // If we got here and didn't directly parse, fall back to standard processing
          if (!directParsingSuccessful) {
            console.log("Direct parsing not successful, falling back to standard processor");
          }
        } catch (parseError) {
          console.log("Error directly parsing response:", parseError);
          // Continue to standard processing if direct parsing fails
        }
        
        // Standard processing for other formats
        const result = processResponse(responseText);
        
        // Update state with processed results
        if (result.content && result.content.length > 0) {
          setGeneratedContent(result.content);
          
          toast.success("Content Generated", {
            description: "Successfully received content from webhook"
          });
        } else {
          // If no content was processed, show an error
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
  
  // Helper to update state with processed results
  const updateStateWithResults = (result: any) => {
    // Update state with processed results
    if (result.content && result.content.length > 0) {
      setGeneratedContent(result.content);
      
      toast.success("Content Generated", {
        description: "Successfully received content from webhook"
      });
    }
    
    if (result.suggestions && result.suggestions.length > 0) {
      setSuggestions(result.suggestions);
    }
    
    if (result.title) {
      setContentTitle(result.title);
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
