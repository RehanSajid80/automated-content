
import { useState } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { toast } from "sonner";

interface N8nAgentPayload {
  keywords: KeywordData[];
  topicArea: string;
  targetUrl: string;
  url?: string;
  requestType: 'contentSuggestions' | 'keywordAnalysis';
  contentType?: string;
}

export const useN8nAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);

  const sendToN8n = async (payload: N8nAgentPayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const storedWebhookUrl = localStorage.getItem("n8n-webhook-url") || 
                               localStorage.getItem("semrush-webhook-url");
      
      const webhookUrl = storedWebhookUrl || "https://officespacesoftware.app.n8n.cloud/webhook/sync-keywords";
      
      if (!webhookUrl) {
        throw new Error("No webhook URL configured. Please check API connections settings.");
      }

      const defaultUrl = "https://www.officespacesoftware.com";
      const targetUrl = payload.targetUrl || defaultUrl;
      
      const finalPayload = {
        ...payload,
        targetUrl,
        url: targetUrl
      };
      
      console.log("Sending data to n8n webhook:", finalPayload);
      console.log("Using webhook URL:", webhookUrl);
      
      const controller = new AbortController();
      // Increase timeout to 60 seconds
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
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
        
        try {
          const data = await response.json();
          console.log("Webhook response data:", data);
          
          if (data.suggestions) {
            setSuggestions(data.suggestions);
          }
          
          if (data.output || data.content) {
            const formattedContent = data.output ? [{ output: data.output }] : Array.isArray(data.content) ? data.content : [data.content];
            setGeneratedContent(formattedContent);
            console.log("Setting generated content:", formattedContent);
          }
          
          toast("Webhook Triggered", {
            description: "Successfully sent data to n8n webhook",
          });
          
          return data;
        } catch (parseError) {
          console.log("Response is not JSON, received status:", response.status);
          
          toast("Webhook Request Sent", {
            description: `Request sent with status ${response.status}, but response was not valid JSON`,
          });
          
          // Return empty data instead of mock data
          return { suggestions: [], content: [] };
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Webhook request timed out after 60 seconds');
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
      
      // Return empty data instead of mock data
      return { suggestions: [], content: [] };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    suggestions,
    generatedContent,
    sendToN8n
  };
};
