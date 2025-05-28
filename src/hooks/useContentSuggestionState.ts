
import { useState, useEffect } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { useAIContentGeneration } from "./content-suggestions/useAIContentGeneration";
import { useN8nAgent } from "./useN8nAgent";

export const useContentSuggestionState = (keywords: KeywordData[]) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicArea, setTopicArea] = useState("");
  const [localKeywords, setLocalKeywords] = useState<KeywordData[]>([]);
  const [isAISuggestionMode, setIsAISuggestionMode] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState("business-executive");
  const [selectedGoal, setSelectedGoal] = useState("thought-leadership");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);

  const {
    isN8nLoading,
    processKeywordsForAI,
    sendContentToN8n
  } = useAIContentGeneration();

  const { sendToN8n } = useN8nAgent();

  // Update local keywords when keywords prop changes
  useEffect(() => {
    if (keywords && keywords.length > 0) {
      console.log("useContentSuggestionState: Updated keywords:", keywords.length);
      setLocalKeywords(keywords);
    }
  }, [keywords]);

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const autoSelectTrendingKeywords = () => {
    const trendingKeywords = localKeywords
      .filter(k => k.trend === "up")
      .slice(0, 5)
      .map(k => k.keyword);
    setSelectedKeywords(trendingKeywords);
  };

  const updateKeywords = (newKeywords: KeywordData[]) => {
    setLocalKeywords(newKeywords);
  };

  const addCustomKeyword = (keyword: string) => {
    if (keyword.trim() && !customKeywords.includes(keyword.trim())) {
      setCustomKeywords(prev => [...prev, keyword.trim()]);
    }
  };

  const handleAISuggestions = async () => {
    if (!topicArea.trim()) {
      console.error("Topic area is required for AI suggestions");
      return;
    }

    console.log("Starting AI suggestions generation...");
    setIsAISuggestionMode(true);

    try {
      // Process keywords for AI
      const { keywordsToProcess, keywordsToSelect } = processKeywordsForAI(
        topicArea,
        localKeywords,
        selectedKeywords,
        customKeywords
      );

      console.log("Sending content to N8N with:", {
        topicArea,
        keywordsCount: keywordsToProcess.length,
        selectedCount: keywordsToSelect.length,
        persona: selectedPersona,
        goal: selectedGoal,
        customKeywords: customKeywords.length
      });

      // Call the N8n agent directly with the content webhook
      const payload = {
        keywords: keywordsToSelect.length > 0 
          ? keywordsToProcess.filter(kw => keywordsToSelect.includes(kw.keyword)) 
          : keywordsToProcess,
        topicArea,
        targetUrl: "https://www.officespacesoftware.com",
        url: "https://www.officespacesoftware.com",
        requestType: 'contentSuggestions',
        output_format: {
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
        },
        customPayload: {
          target_persona: selectedPersona,
          content_goal: selectedGoal,
          custom_keywords: customKeywords
        }
      };

      console.log("Sending payload to N8N webhook:", payload);

      // Send directly to N8N using the content webhook
      const response = await sendToN8n(payload, 'content');

      console.log("AI suggestions response received:", response);
      
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      setIsAISuggestionMode(false);
    }
  };

  return {
    selectedKeywords,
    topicArea,
    setTopicArea,
    localKeywords,
    isN8nLoading,
    isAISuggestionMode,
    selectedPersona,
    setSelectedPersona,
    selectedGoal,
    setSelectedGoal,
    customKeywords,
    toggleKeywordSelection,
    autoSelectTrendingKeywords,
    updateKeywords,
    addCustomKeyword,
    handleAISuggestions
  };
};
