
import React, { useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { KeywordData } from "@/utils/excelUtils";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useEnhancedContentSuggestions } from "@/hooks/useEnhancedContentSuggestions";
import { EnhancedTopicSuggestionForm } from "./content-suggestions/EnhancedTopicSuggestionForm";
import { StructuredContentSuggestions } from "./content-suggestions/StructuredContentSuggestions";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { Badge } from "@/components/ui/badge";

interface EnhancedAISuggestionsTabProps {
  keywordData: KeywordData[];
  className?: string;
}

const EnhancedAISuggestionsTab: React.FC<EnhancedAISuggestionsTabProps> = ({ 
  keywordData,
  className 
}) => {
  const { 
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
  } = useEnhancedContentSuggestions(keywordData);
  
  const { generatedContent, isLoading: isAgentLoading } = useN8nAgent();
  
  // Debug logs to track content state
  useEffect(() => {
    console.log("EnhancedAISuggestionsTab - generatedContent updated:", generatedContent);
    console.log("EnhancedAISuggestionsTab - isN8nLoading:", isN8nLoading);
    console.log("EnhancedAISuggestionsTab - isAgentLoading:", isAgentLoading);
    console.log("EnhancedAISuggestionsTab - isAISuggestionMode:", isAISuggestionMode);
  }, [generatedContent, isN8nLoading, isAgentLoading, isAISuggestionMode]);
  
  // Force showing suggestions if content is available, regardless of isAISuggestionMode
  const shouldShowSuggestions = generatedContent && generatedContent.length > 0;
  
  // Convert generatedContent to the format expected by StructuredContentSuggestions
  const structuredSuggestions = shouldShowSuggestions ? 
    generatedContent.map(item => ({
      topicArea: item.topicArea || topicArea,
      pillarContent: Array.isArray(item.pillarContent) ? item.pillarContent : [item.pillarContent],
      supportPages: Array.isArray(item.supportPages) ? item.supportPages : [item.supportPages],
      metaTags: item.metaTags || [],
      socialMedia: item.socialMedia || [],
      email: item.email || [],
      reasoning: item.reasoning || ""
    })) : [];

  return (
    <TabsContent value="ai-suggestions" className="m-0">
      <div className="container py-8 px-4 md:px-6 lg:px-8 w-full max-w-full">
        <DashboardHeader 
          title="AI Content Suggestions"
          description="Get targeted content suggestions based on personas and business goals"
        />
        
        <div className="rounded-xl border border-border bg-card p-6 w-full max-w-full">
          <EnhancedTopicSuggestionForm
            topicArea={topicArea}
            setTopicArea={setTopicArea}
            updateKeywords={updateKeywords}
            localKeywords={localKeywords}
            selectedKeywords={selectedKeywords}
            toggleKeywordSelection={toggleKeywordSelection}
            autoSelectTrendingKeywords={autoSelectTrendingKeywords}
            isAISuggestionMode={isAISuggestionMode}
            handleAISuggestions={handleAISuggestions}
            isLoading={isN8nLoading || isAgentLoading}
            selectedPersona={selectedPersona}
            setSelectedPersona={setSelectedPersona}
            selectedGoal={selectedGoal}
            setSelectedGoal={setSelectedGoal}
            customKeywords={customKeywords}
            addCustomKeyword={addCustomKeyword}
          />
          
          {/* Always display the structured suggestions when content is available */}
          {shouldShowSuggestions && (
            <StructuredContentSuggestions
              suggestions={structuredSuggestions}
              persona={selectedPersona}
              goal={selectedGoal}
              isLoading={false}
            />
          )}
          
          {/* Debug content display */}
          {process.env.NODE_ENV === 'development' && !shouldShowSuggestions && generatedContent && (
            <div className="mt-6 p-4 border border-yellow-400 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <h3 className="font-medium mb-2">Debug: Raw Content Response</h3>
              <p className="text-sm mb-2">Content is available but may not be processed correctly.</p>
              <pre className="text-xs bg-card p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(generatedContent, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default EnhancedAISuggestionsTab;
