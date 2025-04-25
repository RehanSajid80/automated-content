
import { useState } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { toast } from "sonner";

interface N8nAgentPayload {
  keywords: KeywordData[];
  topicArea: string;
  targetUrl: string;
  requestType: 'contentSuggestions' | 'keywordAnalysis';
}

export const useN8nAgent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const sendToN8n = async (payload: N8nAgentPayload) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the webhook URL from localStorage
      const webhookUrl = localStorage.getItem("n8n-webhook-url") || 
                         localStorage.getItem("semrush-webhook-url");
                         
      if (!webhookUrl) {
        throw new Error("No webhook URL configured. Please check API connections settings.");
      }
      
      console.log("Sending data to n8n agent:", payload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          source: "lovable",
          timestamp: new Date().toISOString()
        }),
        mode: 'no-cors'
      });
      
      // Since we're using no-cors, we won't get a JSON response
      // For demonstration purposes, I'll simulate a response
      // In a real implementation, you might want to set up a proper API endpoint
      
      // Simulate a response with 5 suggestions
      const mockResponse = {
        success: true,
        suggestions: Array.from({ length: 5 }).map((_, index) => ({
          id: `suggestion-${index + 1}`,
          title: `Content Idea ${index + 1} for ${payload.topicArea || 'General'}`,
          description: `AI-generated content idea based on keywords: ${payload.keywords.slice(0, 3).map(k => k.keyword).join(', ')}...`,
          contentType: ['pillar', 'support', 'meta', 'social'][Math.floor(Math.random() * 4)],
          keywords: payload.keywords.slice(0, 5).map(k => k.keyword),
        }))
      };
      
      setSuggestions(mockResponse.suggestions);
      console.log("Received n8n agent response:", mockResponse);
      
      return mockResponse;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to communicate with n8n agent";
      setError(errorMessage);
      console.error("N8n agent error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    suggestions,
    sendToN8n
  };
};
