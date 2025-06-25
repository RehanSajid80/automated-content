
import React, { useEffect, useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { KeywordData } from "@/utils/excelUtils";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { StrategicContentForm } from "./content-suggestions/StrategicContentForm";
import { StructuredContentSuggestions } from "./content-suggestions/StructuredContentSuggestions";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ContentDebugger } from "./content-display/ContentDebugger";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DebugContentViewer } from "./content-display/debug/DebugContentViewer";
import { FileText } from "lucide-react";

interface EnhancedAISuggestionsTabProps {
  keywordData: KeywordData[];
  className?: string;
}

const EnhancedAISuggestionsTab: React.FC<EnhancedAISuggestionsTabProps> = ({ 
  keywordData,
  className 
}) => {
  const [forceRerender, setForceRerender] = useState(0);
  const [isForceProcessing, setIsForceProcessing] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  
  // Single source of truth for all content suggestions
  const [contentSuggestions, setContentSuggestions] = useState<any[]>([]);
  
  const { generatedContent, isLoading: isAgentLoading, rawResponse, setGeneratedContent } = useN8nAgent();
  
  // Debug logs to track content state
  useEffect(() => {
    console.log("EnhancedAISuggestionsTab - generatedContent:", generatedContent);
    console.log("EnhancedAISuggestionsTab - isAgentLoading:", isAgentLoading);
    console.log("EnhancedAISuggestionsTab - rawResponse:", rawResponse);
    console.log("EnhancedAISuggestionsTab - contentSuggestions:", contentSuggestions);
  }, [generatedContent, isAgentLoading, rawResponse, contentSuggestions]);

  // Handle strategic suggestions from the form - this is the primary entry point
  const handleStrategicSuggestions = (suggestions: any[]) => {
    console.log("EnhancedAISuggestionsTab: Received strategic suggestions:", suggestions);
    
    // Convert strategic suggestions to structured format
    const structuredSuggestions = suggestions.map(suggestion => ({
      topicArea: suggestion.topicArea || "Strategic Content",
      pillarContent: Array.isArray(suggestion.pillarContent) ? suggestion.pillarContent : [suggestion.pillarContent].filter(Boolean),
      supportContent: Array.isArray(suggestion.supportPages) ? suggestion.supportPages : [suggestion.supportPages].filter(Boolean),
      metaTags: Array.isArray(suggestion.metaTags) ? 
        suggestion.metaTags.map(tag => typeof tag === 'object' ? `${tag.title} - ${tag.description}` : tag) : 
        [],
      socialMediaPosts: Array.isArray(suggestion.socialMedia) ? suggestion.socialMedia : [suggestion.socialMedia].filter(Boolean),
      emailSeries: Array.isArray(suggestion.email) ? suggestion.email : [suggestion.email].filter(Boolean),
      reasoning: suggestion.reasoning || {}
    }));
    
    console.log("EnhancedAISuggestionsTab: Setting structured suggestions:", structuredSuggestions);
    setContentSuggestions(structuredSuggestions);
    
    // Also update the N8N agent state for consistency
    setGeneratedContent(structuredSuggestions);
  };

  // Sync with N8N agent generated content when it changes
  useEffect(() => {
    if (generatedContent && generatedContent.length > 0 && contentSuggestions.length === 0) {
      console.log("EnhancedAISuggestionsTab: Syncing N8N generated content to contentSuggestions");
      setContentSuggestions(generatedContent);
    }
  }, [generatedContent, contentSuggestions.length]);
  
  // Function to manually process raw response if needed
  const processRawResponse = () => {
    setIsForceProcessing(true);
    if (!rawResponse) {
      toast.error("No raw response available to process");
      setIsForceProcessing(false);
      return;
    }
    
    try {
      console.log("EnhancedAISuggestionsTab: Processing raw response:", typeof rawResponse, rawResponse);
      
      let processedContent = [];
      
      // Handle the response and create structured content
      if (rawResponse && typeof rawResponse === 'object') {
        // Check if it's already in the expected format
        if (rawResponse.pillarContent || rawResponse.supportContent || 
            rawResponse.socialMediaPosts || rawResponse.emailSeries) {
          processedContent = [rawResponse];
        } else if (Array.isArray(rawResponse) && rawResponse.length > 0) {
          // Check if it's an array of content items
          if (rawResponse[0].pillarContent || rawResponse[0].supportContent || 
              rawResponse[0].socialMediaPosts || rawResponse[0].emailSeries) {
            processedContent = rawResponse;
          } else if (rawResponse[0].output) {
            // Handle n8n response format
            try {
              const outputData = typeof rawResponse[0].output === 'string' 
                ? JSON.parse(rawResponse[0].output) 
                : rawResponse[0].output;
              processedContent = Array.isArray(outputData) ? outputData : [outputData];
            } catch (error) {
              console.error("Error parsing output:", error);
              processedContent = [{
                topicArea: "Generated Content",
                pillarContent: [rawResponse[0].output || JSON.stringify(rawResponse[0])],
                supportContent: [],
                socialMediaPosts: [],
                emailSeries: []
              }];
            }
          } else {
            // Generic array handling
            processedContent = rawResponse.map(item => ({
              topicArea: item.title || item.topicArea || "Generated Content",
              pillarContent: [item.content || item.text || JSON.stringify(item)],
              supportContent: [],
              socialMediaPosts: [],
              emailSeries: []
            }));
          }
        } else {
          // Single object that's not in expected format
          processedContent = [{
            topicArea: rawResponse.title || rawResponse.topicArea || "Generated Content",
            pillarContent: [rawResponse.content || rawResponse.text || JSON.stringify(rawResponse)],
            supportContent: [],
            socialMediaPosts: [],
            emailSeries: []
          }];
        }
      } else if (typeof rawResponse === 'string') {
        // Handle string responses
        try {
          const parsedResponse = JSON.parse(rawResponse);
          processedContent = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
        } catch (error) {
          processedContent = [{
            topicArea: "Generated Content",
            pillarContent: [rawResponse],
            supportContent: [],
            socialMediaPosts: [],
            emailSeries: []
          }];
        }
      }
      
      console.log("EnhancedAISuggestionsTab: Setting processed content:", processedContent);
      setContentSuggestions(processedContent);
      setGeneratedContent(processedContent);
      toast.success("Content processed successfully");
    } catch (err) {
      console.error("EnhancedAISuggestionsTab: Error processing raw response:", err);
      toast.error("Failed to process content");
    } finally {
      setIsForceProcessing(false);
    }
  };
  
  // Always show debug mode if there's raw content but no processed content
  const shouldAlwaysShowDebug = rawResponse && contentSuggestions.length === 0;
  
  // Check if we have content to display
  const hasContent = contentSuggestions.length > 0;
                    
  console.log("EnhancedAISuggestionsTab: HasContent check:", hasContent, "Content suggestions:", contentSuggestions.length);

  const handleForceRefresh = () => {
    setForceRerender(prev => prev + 1);
    processRawResponse();
  };

  // Show content in dialog
  const openContentDialog = () => {
    setShowContentDialog(true);
  };

  return (
    <TabsContent value="ai-suggestions" className="m-0">
      <div className="container py-8 px-4 md:px-6 lg:px-8 w-full max-w-full">
        <DashboardHeader 
          title="AI Content Suggestions"
          description="Get targeted content suggestions based on personas and business goals"
        />
        
        <div className="space-y-6">
          <StrategicContentForm onSuggestionsGenerated={handleStrategicSuggestions} />
          
          {(debugMode || shouldAlwaysShowDebug) && !isAgentLoading && !isForceProcessing && (
            <Card className="border-amber-500">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Debug Tools</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={openContentDialog}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      View Content
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleForceRefresh}
                    >
                      Force Process
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDebugMode(!debugMode)}
                    >
                      {debugMode ? "Hide Debug" : "Show Debug"}
                    </Button>
                  </div>
                </div>
                
                <ContentDebugger 
                  generatedContent={generatedContent}
                  forceRender={handleForceRefresh}
                  rawResponse={rawResponse}
                />
              </div>
            </Card>
          )}
          
          {/* Show generated content when available */}
          {!isAgentLoading && !isForceProcessing && hasContent && (
            <StructuredContentSuggestions
              key={`suggestions-${forceRerender}-${contentSuggestions.length}`}
              suggestions={contentSuggestions}
              persona="strategic-marketing"
              goal="content-suggestions"
              isLoading={false}
            />
          )}
          
          {/* Show loading state */}
          {(isAgentLoading || isForceProcessing) && (
            <div className="p-8 flex justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                <p className="text-muted-foreground">
                  {isForceProcessing ? "Processing content..." : "Generating strategic content suggestions..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog for viewing content */}
      <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle>AI Content Suggestions</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1 h-full">
            <DebugContentViewer 
              rawResponse={rawResponse}
              processedContent={contentSuggestions.length > 0 ? contentSuggestions : (rawResponse ? [rawResponse] : [])}
            />
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default EnhancedAISuggestionsTab;
