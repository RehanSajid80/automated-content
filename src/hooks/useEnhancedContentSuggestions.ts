
import { useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { toast } from "sonner";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import { personaTypes } from "@/data/personaTypes";
import { contentGoals } from "@/data/contentGoals";

export const useEnhancedContentSuggestions = (initialKeywords: KeywordData[]) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicArea, setTopicArea] = useState<string>("");
  const [localKeywords, setLocalKeywords] = useState(initialKeywords);
  const [isN8nLoading, setIsN8nLoading] = useState(false);
  const [isAISuggestionMode, setIsAISuggestionMode] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string>("facility-manager");
  const [selectedGoal, setSelectedGoal] = useState<string>("increase-seo");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  
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
  
  const addCustomKeyword = (keyword: string) => {
    if (isAISuggestionMode) return;
    
    if (!customKeywords.includes(keyword)) {
      setCustomKeywords(prev => [...prev, keyword]);
      // Also add to selected keywords
      if (!selectedKeywords.includes(keyword)) {
        setSelectedKeywords(prev => [...prev, keyword]);
      }
    }
  };
  
  const autoSelectTrendingKeywords = () => {
    if (isAISuggestionMode) return;
    
    const trendingKeywords = localKeywords
      .filter(kw => kw.trend === "up")
      .map(kw => kw.keyword);
    
    setSelectedKeywords(trendingKeywords);
    
    if (trendingKeywords.length > 0) {
      toast.success("Trending Keywords Selected", {
        description: `Selected ${trendingKeywords.length} trending keywords automatically`
      });
    } else {
      toast.error("No Trending Keywords Found", {
        description: "No trending keywords were found in your dataset"
      });
    }
  };

  const updateKeywords = (newKeywords: KeywordData[]) => {
    if (newKeywords && newKeywords.length > 0) {
      setLocalKeywords(newKeywords);
      setSelectedKeywords([]);
      toast.success("Keywords Updated", {
        description: `Added ${newKeywords.length} keywords for ${topicArea || "general"} analysis`
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
      toast.error("Topic Area Required", {
        description: "Please select a topic area before getting AI suggestions"
      });
      return;
    }
    
    let keywordsToProcess = localKeywords;
    let keywordsToSelect = selectedKeywords;
    
    if (selectedKeywords.length === 0 && customKeywords.length === 0) {
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
    
    setIsN8nLoading(true);
    setIsAISuggestionMode(true);
    
    try {
      const personaName = personaTypes.find(p => p.id === selectedPersona)?.name || "Generic User";
      const goalName = contentGoals.find(g => g.id === selectedGoal)?.name || "General Content";
      
      await sendToN8n({
        keywords: keywordsToSelect.length > 0 
          ? keywordsToProcess.filter(kw => keywordsToSelect.includes(kw.keyword)) 
          : keywordsToProcess,
        topicArea,
        targetUrl: targetUrl || "https://www.officespacesoftware.com",
        url: targetUrl || "https://www.officespacesoftware.com",
        requestType: 'contentSuggestions',
        customPayload: {
          target_persona: selectedPersona,
          persona_name: personaName,
          content_goal: selectedGoal,
          goal_name: goalName,
          custom_keywords: customKeywords
        }
      }, true);
      
      toast.success("AI Suggestions Ready", {
        description: "Content suggestions generated for your selected criteria"
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to get AI suggestions"
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
    handleAISuggestions,
    selectedPersona,
    setSelectedPersona,
    selectedGoal,
    setSelectedGoal,
    customKeywords,
    addCustomKeyword
  };
};
