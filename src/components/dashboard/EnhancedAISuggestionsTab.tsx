
import React, { useEffect, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { KeywordData } from "@/utils/excelUtils";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useEnhancedContentSuggestions } from "@/hooks/useEnhancedContentSuggestions";
import { EnhancedTopicSuggestionForm } from "./content-suggestions/EnhancedTopicSuggestionForm";
import { StructuredContentSuggestions } from "./content-suggestions/StructuredContentSuggestions";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ContentDebugger } from "./content-display/ContentDebugger";

interface EnhancedAISuggestionsTabProps {
  keywordData: KeywordData[];
  className?: string;
}

const EnhancedAISuggestionsTab: React.FC<EnhancedAISuggestionsTabProps> = ({ 
  keywordData,
  className 
}) => {
  const [forceRerender, setForceRerender] = useState(0);
  
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
  
  const { generatedContent, isLoading: isAgentLoading, rawResponse, setGeneratedContent } = useN8nAgent();
  
  // Debug logs to track content state
  useEffect(() => {
    console.log("EnhancedAISuggestionsTab - generatedContent updated:", generatedContent);
    console.log("EnhancedAISuggestionsTab - isN8nLoading:", isN8nLoading);
    console.log("EnhancedAISuggestionsTab - isAgentLoading:", isAgentLoading);
    console.log("EnhancedAISuggestionsTab - isAISuggestionMode:", isAISuggestionMode);
    console.log("EnhancedAISuggestionsTab - rawResponse:", rawResponse);
  }, [generatedContent, isN8nLoading, isAgentLoading, isAISuggestionMode, rawResponse]);
  
  // Function to manually process raw response if needed
  const processRawResponse = () => {
    if (!rawResponse) return;
    
    try {
      let processedContent;
      
      if (typeof rawResponse === 'string') {
        processedContent = JSON.parse(rawResponse);
      } else {
        processedContent = rawResponse;
      }
      
      // Handle both array and single object formats
      if (Array.isArray(processedContent)) {
        if (processedContent.length === 0) {
          toast.error("Empty response received from AI");
          return;
        }
        setGeneratedContent(processedContent);
      } else {
        // Single object format, convert to array
        setGeneratedContent([processedContent]);
      }
      
      toast.success("Content processed successfully");
    } catch (err) {
      console.error("Error processing raw response:", err);
      toast.error("Failed to process content");
    }
  };
  
  // Force showing suggestions if content is available, regardless of isAISuggestionMode
  const hasContent = generatedContent && generatedContent.length > 0;
  
  // Convert generatedContent to the format expected by StructuredContentSuggestions
  const structuredSuggestions = hasContent ? 
    generatedContent.map(item => ({
      topicArea: item.topicArea || topicArea || item.title || "Content Suggestions",
      pillarContent: Array.isArray(item.pillarContent) ? item.pillarContent : [item.pillarContent].filter(Boolean),
      supportPages: Array.isArray(item.supportPages) ? item.supportPages : 
                   Array.isArray(item.supportContent) ? item.supportContent : 
                   [item.supportContent || item.supportPages].filter(Boolean),
      metaTags: item.metaTags || [],
      socialMedia: item.socialMedia || item.socialMediaPosts || [],
      email: item.email || (item.emailSeries ? 
        item.emailSeries.map((email: any) => 
          `Subject: ${email.subject}\n\n${email.body}`
        ) : []),
      reasoning: item.reasoning || ""
    })) : [];
    
  const handleForceRefresh = () => {
    setForceRerender(prev => prev + 1);
    processRawResponse();
  };

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
          
          {/* Show when data is loading */}
          {(isN8nLoading || isAgentLoading) && (
            <div className="p-8 flex justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <p className="text-muted-foreground">Generating content suggestions...</p>
              </div>
            </div>
          )}
          
          {/* Always display the structured suggestions when content is available */}
          {!isN8nLoading && !isAgentLoading && structuredSuggestions.length > 0 && (
            <StructuredContentSuggestions
              key={`suggestions-${forceRerender}`}
              suggestions={structuredSuggestions}
              persona={selectedPersona}
              goal={selectedGoal}
              isLoading={false}
            />
          )}
          
          {/* Show error message when no content is displayed */}
          {!isN8nLoading && !isAgentLoading && isAISuggestionMode && 
           (!hasContent || structuredSuggestions.length === 0) && rawResponse && (
            <Alert className="mt-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Content Displayed</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Content was generated but couldn't be properly formatted for display. This may be due to an unexpected response format.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 flex items-center gap-2"
                  onClick={handleForceRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                  Process Raw Response
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Debug content display */}
          {(process.env.NODE_ENV === 'development' || true) && rawResponse && (
            <Card className="mt-6 p-4 border border-yellow-400 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <ContentDebugger 
                generatedContent={generatedContent}
                forceRender={handleForceRefresh}
              />
              
              <h3 className="font-medium mb-2">Debug: Raw Content Response</h3>
              <p className="text-sm mb-2">Content is available but may not be processed correctly.</p>
              <pre className="text-xs bg-card p-3 rounded overflow-auto max-h-40">
                {typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse, null, 2)}
              </pre>
              
              <h4 className="font-medium mt-4 mb-2">Processed Content</h4>
              <pre className="text-xs bg-card p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(generatedContent, null, 2)}
              </pre>
              
              <h4 className="font-medium mt-4 mb-2">Structured Content</h4>
              <pre className="text-xs bg-card p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(structuredSuggestions, null, 2)}
              </pre>
            </Card>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default EnhancedAISuggestionsTab;
