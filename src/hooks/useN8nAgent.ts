
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
        
        // First, try to parse the response as JSON
        try {
          let parsedData = null;
          
          if (typeof responseText === 'string' && responseText.trim()) {
            parsedData = JSON.parse(responseText);
          }
          
          // Special handling for empty array response
          if (Array.isArray(parsedData) && parsedData.length === 0) {
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
          
          // Handle AI Content Suggestions format
          if (parsedData) {
            let structuredContent = [];
            let directParsingSuccessful = false;
            
            // Check if it's an array with expected format
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              const firstItem = parsedData[0];
              
              if (firstItem && 
                 (firstItem.pillarContent || firstItem.supportContent || 
                  firstItem.socialMediaPosts || firstItem.emailSeries)) {
                console.log("Detected AI Content Suggestions array format");
                
                structuredContent = parsedData.map(item => ({
                  topicArea: item.title || payload.topicArea || "Content Suggestions",
                  pillarContent: typeof item.pillarContent === 'string' ? [item.pillarContent] : item.pillarContent || [],
                  supportPages: typeof item.supportContent === 'string' ? [item.supportContent] : item.supportContent || [],
                  metaTags: item.metaTags || [],
                  socialMedia: item.socialMediaPosts || [],
                  email: item.emailSeries ? 
                    item.emailSeries.map((email: any) => 
                      `Subject: ${email.subject}\n\n${email.body}`
                    ) : [],
                  reasoning: item.reasoning || null
                }));
                
                setGeneratedContent(structuredContent);
                directParsingSuccessful = true;
                
                toast.success("Content Generated", {
                  description: "Successfully received AI content suggestions"
                });
              }
            } 
            // Try single object format
            else if (parsedData && 
                   (parsedData.pillarContent || 
                    parsedData.supportContent || 
                    parsedData.socialMediaPosts || 
                    parsedData.emailSeries)) {
              console.log("Detected AI Content Suggestions single object format");
              
              structuredContent = [{
                topicArea: parsedData.title || payload.topicArea || "Content Suggestions",
                pillarContent: typeof parsedData.pillarContent === 'string' ? [parsedData.pillarContent] : parsedData.pillarContent || [],
                supportPages: typeof parsedData.supportContent === 'string' ? [parsedData.supportContent] : parsedData.supportContent || [],
                metaTags: parsedData.metaTags || [],
                socialMedia: parsedData.socialMediaPosts || [],
                email: parsedData.emailSeries ? 
                  parsedData.emailSeries.map((email: any) => 
                    `Subject: ${email.subject}\n\n${email.body}`
                  ) : [],
                reasoning: parsedData.reasoning || null
              }];
              
              setGeneratedContent(structuredContent);
              directParsingSuccessful = true;
              
              toast.success("Content Generated", {
                description: "Successfully received AI content suggestions"
              });
            }
            
            if (directParsingSuccessful) {
              return {
                suggestions: [],
                content: structuredContent,
                title: Array.isArray(parsedData) && parsedData[0]?.title || '',
                rawResponse: responseText
              };
            }
          }
        } catch (parseError) {
          console.log("Error directly parsing response:", parseError);
          // Fall through to standard processing
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
