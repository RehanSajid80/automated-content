
import { useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";

export const useContentSuggestionState = (initialKeywords: KeywordData[]) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicArea, setTopicArea] = useState<string>("");
  const [localKeywords, setLocalKeywords] = useState(initialKeywords);
  const [isN8nLoading, setIsN8nLoading] = useState(false);
  const [isAISuggestionMode, setIsAISuggestionMode] = useState(false);
  const { toast } = useToast();
  const { sendToN8n } = useN8nAgent();
  const { targetUrl } = useUrlSuggestions();

  const toggleKeywordSelection = (keyword: string) => {
    if (isAISuggestionMode) return;
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };
  
  const autoSelectTrendingKeywords = () => {
    if (isAISuggestionMode) return;
    
    const trendingKeywords = localKeywords
      .filter(kw => kw.trend === "up")
      .map(kw => kw.keyword);
    
    setSelectedKeywords(trendingKeywords);
    
    if (trendingKeywords.length > 0) {
      toast({
        title: "Trending Keywords Selected",
        description: `Selected ${trendingKeywords.length} trending keywords automatically`,
      });
    } else {
      toast({
        title: "No Trending Keywords Found",
        description: "No trending keywords were found in your dataset",
      });
    }
  };

  const updateKeywords = (newKeywords: KeywordData[]) => {
    if (newKeywords && newKeywords.length > 0) {
      setLocalKeywords(newKeywords);
      setSelectedKeywords([]);
      toast({
        title: "Keywords Updated",
        description: `Added ${newKeywords.length} keywords for ${topicArea || "general"} analysis`,
      });
    }
  };

  const createTopicKeywords = (topic: string): KeywordData[] => {
    const baseKeywords: {[key: string]: string[]} = {
      "workspace-management": ["workspace optimization", "office layout", "workspace flexibility"],
      "office-analytics": ["office usage metrics", "workspace analytics", "office data insights"],
      "desk-booking": ["hot desk booking", "desk reservation system", "flexible seating"],
      "workplace-technology": ["workplace tech stack", "office technology solutions", "smart office"],
      "facility-management": ["facility maintenance", "building management", "space planning"],
      "asset-management": ["asset tracking software", "inventory management", "equipment lifecycle"]
    };
    
    const keywords = baseKeywords[topic] || [`${topic} solutions`, `${topic} software`, `${topic} best practices`];
    
    return keywords.map((keyword, index) => ({
      keyword,
      volume: 1000 - (index * 200),
      difficulty: 40 + (index * 5),
      cpc: 1.5 - (index * 0.2),
      trend: index === 0 ? "up" : "neutral"
    }));
  };

  const handleAISuggestions = async () => {
    if (!topicArea) {
      toast({
        title: "Topic Area Required",
        description: "Please select a topic area before getting AI suggestions",
      });
      return;
    }
    
    let keywordsToProcess = localKeywords;
    let keywordsToSelect = selectedKeywords;
    
    if (selectedKeywords.length === 0) {
      // If no specific keywords are selected, generate dummy keywords for the topic
      const dummyKeywords: KeywordData[] = [
        {
          keyword: topicArea,
          volume: 1000,
          difficulty: 50,
          cpc: 1.0,
          trend: "up"
        }
      ];
      
      // Add a few more keywords based on the topic area
      const topicKeywords = createTopicKeywords(topicArea);
      keywordsToProcess = [...dummyKeywords, ...topicKeywords];
      
      setLocalKeywords(keywordsToProcess);
      keywordsToSelect = [topicArea];
      setSelectedKeywords([topicArea]);
    }
    
    setIsN8nLoading(true);
    setIsAISuggestionMode(true);
    
    try {
      await sendToN8n({
        keywords: keywordsToSelect.length > 0 
          ? keywordsToProcess.filter(kw => keywordsToSelect.includes(kw.keyword)) 
          : keywordsToProcess,
        topicArea,
        targetUrl: targetUrl || "https://www.officespacesoftware.com",
        url: targetUrl || "https://www.officespacesoftware.com",
        requestType: 'contentSuggestions'
      });
      
      toast({
        title: "AI Suggestions Ready",
        description: "Select one of the suggestions below to proceed",
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI suggestions",
      });
    } finally {
      setIsN8nLoading(false);
    }
  };

  return {
    selectedKeywords,
    topicArea,
    setTopicArea,
    localKeywords,
    isN8nLoading,
    isAISuggestionMode,
    toggleKeywordSelection,
    autoSelectTrendingKeywords,
    updateKeywords,
    handleAISuggestions
  };
};
