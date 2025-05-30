
import { useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { toast } from "sonner";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import { personaTypes } from "@/data/personaTypes";
import { contentGoals } from "@/data/contentGoals";

/**
 * Hook for managing AI content generation
 */
export const useAIContentGeneration = () => {
  const [isN8nLoading, setIsN8nLoading] = useState(false);
  const { sendToN8n } = useN8nAgent();
  const { targetUrl } = useUrlSuggestions();
  
  // Process keywords for AI suggestions
  const processKeywordsForAI = (
    topicArea: string,
    localKeywords: KeywordData[],
    selectedKeywords: string[],
    customKeywords: string[]
  ): { keywordsToProcess: KeywordData[], keywordsToSelect: string[] } => {
    let keywordsToProcess = [...localKeywords];
    let keywordsToSelect = [...selectedKeywords];
    
    // If no specific keywords are selected, generate dummy keywords for the topic
    if (selectedKeywords.length === 0 && customKeywords.length === 0) {
      // First create a primary keyword from the topic
      const dummyKeywords: KeywordData[] = [
        {
          keyword: topicArea,
          volume: 1000,
          difficulty: 50,
          cpc: 1.0,
          trend: "up"
        }
      ];
      
      keywordsToProcess = dummyKeywords;
      keywordsToSelect = [topicArea];
    }
    
    // Add custom keywords to the keywords to process
    if (customKeywords.length > 0) {
      const customKeywordsData: KeywordData[] = customKeywords.map((keyword, index) => ({
        keyword,
        volume: 500,
        difficulty: 45,
        cpc: 1.0,
        trend: "neutral",
        isCustom: true
      }));
      
      keywordsToProcess = [...keywordsToProcess, ...customKeywordsData];
      
      // Make sure all custom keywords are selected
      customKeywords.forEach(keyword => {
        if (!keywordsToSelect.includes(keyword)) {
          keywordsToSelect.push(keyword);
        }
      });
    }
    
    return { keywordsToProcess, keywordsToSelect };
  };
  
  // Send content to n8n for processing
  const sendContentToN8n = async (
    topicArea: string,
    keywordsToProcess: KeywordData[],
    keywordsToSelect: string[],
    selectedPersona: string,
    selectedGoal: string,
    customKeywords: string[]
  ) => {
    setIsN8nLoading(true);
    
    try {
      const personaName = personaTypes.find(p => p.id === selectedPersona)?.name || "Generic User";
      const goalName = contentGoals.find(g => g.id === selectedGoal)?.name || "General Content";
      
      console.log(`Sending content request to n8n for persona: ${personaName}, goal: ${goalName}`);
      console.log(`Keywords: ${keywordsToSelect.join(", ")}`);
      
      // Define expected output format - explicitly matching the format we're receiving
      const outputFormat = {
        pillarContent: "A headline or detailed title for the main article",
        supportContent: "A headline or detailed title for supporting content",
        socialMediaPosts: [
          "LinkedIn style post with hashtags",
          "Twitter/X style post with hashtags",
          "Instagram/Facebook style post with emojis"
        ],
        emailSeries: [
          {
            subject: "Compelling email subject line 1",
            body: "Brief email body text"
          },
          {
            subject: "Compelling email subject line 2",
            body: "Brief email body text"
          },
          {
            subject: "Compelling email subject line 3", 
            body: "Brief email body text"
          }
        ],
        reasoning: {
          pillarContent: "Strategic reasoning behind pillar content",
          supportContent: "Strategic reasoning behind support content",
          socialMediaPosts: "Strategic reasoning behind social media approach",
          emailSeries: "Strategic reasoning behind email series approach"
        }
      };
      
      // This is the exact payload that gets sent to the webhook - using content webhook
      const response = await sendToN8n({
        keywords: keywordsToSelect.length > 0 
          ? keywordsToProcess.filter(kw => keywordsToSelect.includes(kw.keyword)) 
          : keywordsToProcess,
        topicArea,
        targetUrl: targetUrl || "https://www.officespacesoftware.com",
        url: targetUrl || "https://www.officespacesoftware.com",
        requestType: 'contentSuggestions',
        output_format: outputFormat,
        customPayload: {
          target_persona: selectedPersona,
          persona_name: personaName,
          content_goal: selectedGoal,
          goal_name: goalName,
          custom_keywords: customKeywords,
          expected_format: JSON.stringify(outputFormat)
        }
      }, 'content'); // Explicitly specify content webhook
      
      console.log("N8N response received:", response);
      
      toast.success("AI Suggestions Ready", {
        description: "Content suggestions generated for your selected criteria"
      });
      
      return response;
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to get AI suggestions"
      });
      throw error;
    } finally {
      setIsN8nLoading(false);
    }
  };
  
  return {
    isN8nLoading,
    setIsN8nLoading,
    processKeywordsForAI,
    sendContentToN8n
  };
};
