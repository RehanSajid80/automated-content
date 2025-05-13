
import { useState } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { toast } from "sonner";

interface N8nAgentPayload {
  keywords?: KeywordData[];
  topicArea?: string;
  targetUrl?: string;
  url?: string;
  requestType?: 'contentSuggestions' | 'keywordAnalysis';
  contentType?: string;
  chatHistory?: any[];
  currentInstruction?: string;
  currentImageUrl?: string;
  customPayload?: any;
}

export const useN8nAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const sendToN8n = async (payload: N8nAgentPayload, customWebhookUrl?: string) => {
    setIsLoading(true);
    setError(null);
    setRawResponse(null);
    
    try {
      // Use custom webhook URL if provided, otherwise use stored webhook URL
      const storedWebhookUrl = localStorage.getItem("n8n-webhook-url") || 
                               localStorage.getItem("semrush-webhook-url");
      
      const webhookUrl = customWebhookUrl || storedWebhookUrl || "https://officespacesoftware.app.n8n.cloud/webhook/sync-keywords";
      
      if (!webhookUrl) {
        throw new Error("No webhook URL configured. Please check API connections settings.");
      }

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
      console.log("Using webhook URL:", webhookUrl);
      
      const controller = new AbortController();
      // Increase timeout to 180 seconds (3 minutes)
      const timeoutId = setTimeout(() => controller.abort(), 180000);
      
      try {
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
        
        let data;
        try {
          data = JSON.parse(responseText);
          console.log("Parsed webhook response data:", data);
        } catch (parseError) {
          console.log("Response is not valid JSON, treating as raw content");
          // If the response is not JSON, create a structured object with the raw text
          data = {
            content: [{ output: responseText }]
          };
        }
        
        // Always store the original response for debugging
        console.log("Final processed data:", data);
        
        // Handle suggestions if they exist
        if (data && data.suggestions) {
          console.log("Found suggestions in response:", data.suggestions);
          setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : [data.suggestions]);
        }
        
        // Initialize contentArray early to avoid scope issues
        let contentArray: any[] = [];
        
        // Handle content with multiple possible formats
        if (data) {
          if (data.output) {
            console.log("Found output property in response");
            contentArray = [{ output: data.output }];
          } else if (data.content) {
            console.log("Found content property in response");
            contentArray = Array.isArray(data.content) ? data.content : [{ output: data.content }];
          } else if (typeof data === "string") {
            console.log("Response is a string, using as output");
            contentArray = [{ output: data }];
          } else if (data.results) {
            console.log("Found results property in response");
            contentArray = Array.isArray(data.results) ? data.results : [{ output: data.results }];
          } else if (data.text) {
            console.log("Found text property in response");
            contentArray = [{ output: data.text }];
          } else if (data.data) {
            console.log("Found data property in response");
            const content = typeof data.data === 'string' ? data.data : JSON.stringify(data.data);
            contentArray = [{ output: content }];
          } else {
            // As a last resort, stringify the whole response
            console.log("No standard content structure found, using entire response");
            contentArray = [{ output: JSON.stringify(data) }];
          }
          
          // Ensure every item has an output property
          contentArray = contentArray.map(item => {
            if (!item.output && item.content) {
              return { ...item, output: item.content };
            } else if (!item.output) {
              return { ...item, output: JSON.stringify(item) };
            }
            return item;
          });
          
          console.log("Setting generated content:", contentArray);
          setGeneratedContent(contentArray);
          
          toast("Content Generated", {
            description: "Successfully received content from webhook",
          });
        }
        
        return {
          suggestions: data?.suggestions || [],
          content: contentArray || [],
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
      
      toast("Webhook Error", {
        description: errorMessage,
        style: { backgroundColor: 'red', color: 'white' }
      });
      
      return { suggestions: [], content: [], error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    suggestions,
    generatedContent,
    rawResponse,
    sendToN8n,
    setGeneratedContent
  };
};
