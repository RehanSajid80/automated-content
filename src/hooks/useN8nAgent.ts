
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { resolveWebhookUrl } from "./useN8nAgent/webhookUrlResolver";
import { processAIResponse } from "./useN8nAgent/aiContentFormatUtils";
import { N8nAgentResponse, WebhookPayload } from "./useN8nAgent/types";

export const useN8nAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [contentTitle, setContentTitle] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('n8n-generated-content');
    const savedTitle = localStorage.getItem('n8n-content-title');
    
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setGeneratedContent(parsedContent);
      } catch (error) {
        console.error("Error parsing saved content:", error);
      }
    }
    
    if (savedTitle) {
      setContentTitle(savedTitle);
    }
  }, []);

  const sendToN8n = useCallback(async (
    payload: WebhookPayload | { customPayload?: any },
    webhookType?: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment' | 'content-generation' | boolean
  ): Promise<N8nAgentResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Resolve webhook type
      let resolvedWebhookType: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment' | 'content-generation' = 'content';
      
      if (typeof webhookType === 'string') {
        resolvedWebhookType = webhookType;
      } else if (webhookType === true) {
        resolvedWebhookType = 'content';
      }

      // Get the appropriate webhook URL from Supabase
      const webhookUrl = await resolveWebhookUrl(resolvedWebhookType);
      
      console.log(`Sending to ${resolvedWebhookType} webhook:`, webhookUrl);
      console.log("Payload:", payload);

      const requestPayload = 'customPayload' in payload ? payload.customPayload : payload;

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("N8N Response:", responseData);

      // Store raw response
      setRawResponse(responseData);

      // Process the response for content generation
      const processedContent = processAIResponse(responseData);
      
      if (processedContent && processedContent.length > 0) {
        setGeneratedContent(processedContent);
        setSuggestions(processedContent);
        // Save to localStorage for persistence
        localStorage.setItem('n8n-generated-content', JSON.stringify(processedContent));
        
        // Extract and save title if available
        const title = processedContent[0]?.title || `Generated content - ${new Date().toLocaleDateString()}`;
        setContentTitle(title);
        localStorage.setItem('n8n-content-title', title);
      }

      return {
        success: true,
        content: processedContent,
        rawResponse: responseData,
        title: contentTitle,
        suggestions: processedContent
      };

    } catch (error) {
      console.error("Error sending to N8N:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      
      toast.error(`Failed to connect to webhook: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
        content: [],
        rawResponse: null,
        title: "",
        suggestions: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [contentTitle]);

  return {
    sendToN8n,
    isLoading,
    generatedContent,
    rawResponse,
    contentTitle,
    suggestions,
    error,
    setGeneratedContent,
    setContentTitle
  };
};
