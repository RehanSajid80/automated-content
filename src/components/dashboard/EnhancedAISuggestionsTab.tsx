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
  
  const { generatedContent, isLoading: isAgentLoading, rawResponse, setGeneratedContent } = useN8nAgent();
  
  // Debug logs to track content state
  useEffect(() => {
    console.log("EnhancedAISuggestionsTab - generatedContent:", generatedContent);
    console.log("EnhancedAISuggestionsTab - isAgentLoading:", isAgentLoading);
    console.log("EnhancedAISuggestionsTab - rawResponse:", rawResponse);
  }, [generatedContent, isAgentLoading, rawResponse]);
  
  // Auto-process raw response if present
  useEffect(() => {
    if (rawResponse && (!generatedContent || generatedContent.length === 0)) {
      console.log("Auto-processing raw response since no generated content is available");
      processRawResponse();
    }
  }, [rawResponse, generatedContent]);
  
  // Function to manually process raw response if needed
  const processRawResponse = () => {
    setIsForceProcessing(true);
    if (!rawResponse) {
      toast.error("No raw response available to process");
      setIsForceProcessing(false);
      return;
    }
    
    try {
      let processedContent;
      
      // Handle empty array as a special case
      if (Array.isArray(rawResponse) && rawResponse.length === 0) {
        toast.error("Empty array response - no content to display");
        setIsForceProcessing(false);
        return;
      }
      
      console.log("Processing raw response:", typeof rawResponse, rawResponse);
      
      // If rawResponse is directly usable, use it
      if (rawResponse && (
        (typeof rawResponse === 'object' && (
          rawResponse.pillarContent !== undefined ||
          rawResponse.supportContent !== undefined ||
          rawResponse.socialMediaPosts !== undefined ||
          rawResponse.emailSeries !== undefined
        )) ||
        (Array.isArray(rawResponse) && rawResponse.length > 0 && typeof rawResponse[0] === 'object' && (
          rawResponse[0].pillarContent !== undefined ||
          rawResponse[0].supportContent !== undefined ||
          rawResponse[0].socialMediaPosts !== undefined ||
          rawResponse[0].emailSeries !== undefined
        ))
      )) {
        // Wrap single object in array for consistent handling if needed
        processedContent = Array.isArray(rawResponse) ? rawResponse : [rawResponse];
        console.log("Using content directly:", processedContent);
        setGeneratedContent(processedContent);
        toast.success("Content processed successfully");
        setIsForceProcessing(false);
        return;
      }
      
      if (typeof rawResponse === 'string') {
        // Attempt to parse string as JSON
        try {
          console.log("Attempting to parse string response as JSON");
          processedContent = JSON.parse(rawResponse);
          
          console.log("Parsed content:", processedContent);
          
          // Check if parsed content is properly formatted
          if (processedContent && (
            (Array.isArray(processedContent) && processedContent.length > 0 && typeof processedContent[0] === 'object' && (
              processedContent[0].pillarContent !== undefined ||
              processedContent[0].supportContent !== undefined ||
              processedContent[0].socialMediaPosts !== undefined ||
              processedContent[0].emailSeries !== undefined
            )) ||
            (typeof processedContent === 'object' && (
              processedContent.pillarContent !== undefined || 
              processedContent.supportContent !== undefined || 
              processedContent.socialMediaPosts !== undefined || 
              processedContent.emailSeries !== undefined
            ))
          )) {
            // Handle both array and single object formats
            const contentArray = Array.isArray(processedContent) ? processedContent : [processedContent];
            console.log("Setting generated content from parsed JSON:", contentArray);
            setGeneratedContent(contentArray);
          } else {
            console.log("Parsed content doesn't match expected format");
            // Create a structured format from unstructured response
            setGeneratedContent([{ 
              pillarContent: typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse),
              supportContent: "",
              socialMediaPosts: [],
              emailSeries: []
            }]);
          }
        } catch (parseError) {
          console.error("Error parsing raw response as JSON:", parseError);
          // If can't parse as JSON, treat the string as content directly
          processedContent = [{ 
            pillarContent: rawResponse,
            supportContent: "",
            socialMediaPosts: [],
            emailSeries: []
          }];
          console.log("Using raw string as content:", processedContent);
          setGeneratedContent(processedContent);
        }
      } else {
        // For other types, wrap in array as needed
        processedContent = rawResponse;
        console.log("Using non-string content directly:", processedContent);
        setGeneratedContent(Array.isArray(processedContent) ? processedContent : [processedContent]);
      }
      
      toast.success("Content processed successfully");
    } catch (err) {
      console.error("Error processing raw response:", err);
      toast.error("Failed to process content");
    } finally {
      setIsForceProcessing(false);
    }
  };
  
  // Convert generatedContent to the format expected by StructuredContentSuggestions
  const processContentForDisplay = (contentArray: any[]) => {
    if (!contentArray || contentArray.length === 0) return [];
    
    console.log("Processing content array for display:", contentArray);
    
    return contentArray.map(item => {
      // Initialize with default values
      const structuredItem: any = {
        topicArea: item.topicArea || item.title || "Content Suggestions",
        pillarContent: [],
        supportPages: [],
        metaTags: [],
        socialMedia: [],
        email: [],
        reasoning: item.reasoning || {}
      };
      
      // Process pillar content
      if (item.pillarContent) {
        if (typeof item.pillarContent === 'string') {
          structuredItem.pillarContent = [item.pillarContent];
        } else if (Array.isArray(item.pillarContent)) {
          structuredItem.pillarContent = item.pillarContent;
        } else if (typeof item.pillarContent === 'object') {
          if (item.pillarContent.content) {
            structuredItem.pillarContent = [item.pillarContent.content];
          } else if (item.pillarContent.title) {
            structuredItem.pillarContent = [item.pillarContent.title];
          } else {
            structuredItem.pillarContent = [JSON.stringify(item.pillarContent)];
          }
        }
      }
      
      // Process support content
      if (item.supportContent) {
        if (typeof item.supportContent === 'string') {
          structuredItem.supportPages = [item.supportContent];
        } else if (Array.isArray(item.supportContent)) {
          structuredItem.supportPages = item.supportContent;
        } else if (typeof item.supportContent === 'object') {
          if (item.supportContent.content) {
            structuredItem.supportPages = [item.supportContent.content];
          } else if (item.supportContent.title) {
            structuredItem.supportPages = [item.supportContent.title];
          } else {
            structuredItem.supportPages = [JSON.stringify(item.supportContent)];
          }
        }
      } else if (item.supportPages) {
        structuredItem.supportPages = Array.isArray(item.supportPages) ? 
          item.supportPages : [item.supportPages];
      }
      
      // Process meta tags
      if (item.metaTags) {
        structuredItem.metaTags = Array.isArray(item.metaTags) ? 
          item.metaTags : [item.metaTags];
      }
      
      // Process social media posts
      if (item.socialMediaPosts) {
        structuredItem.socialMedia = Array.isArray(item.socialMediaPosts) ? 
          item.socialMediaPosts : [item.socialMediaPosts];
      } else if (item.socialMedia) {
        structuredItem.socialMedia = Array.isArray(item.socialMedia) ? 
          item.socialMedia : [item.socialMedia];
      } else if (item.socialPosts) {
        structuredItem.socialMedia = Array.isArray(item.socialPosts) ? 
          item.socialPosts : [item.socialPosts];
      }
      
      // Process email series
      if (item.emailSeries) {
        structuredItem.email = item.emailSeries;
      } else if (item.email) {
        structuredItem.email = Array.isArray(item.email) ? item.email : [item.email];
      } else if (item.emailCampaign) {
        structuredItem.email = Array.isArray(item.emailCampaign) ? 
          item.emailCampaign : [item.emailCampaign];
      }
      
      return structuredItem;
    });
  };
  
  // Always show debug mode if there's raw content but no processed content
  const shouldAlwaysShowDebug = rawResponse && (!generatedContent || generatedContent.length === 0);
  
  // Force showing suggestions if content is available
  const hasContent = Boolean(
    (rawResponse && typeof rawResponse === 'object') || 
    (generatedContent && generatedContent.length > 0)
  );
                    
  console.log("HasContent check:", hasContent, "Generated content:", generatedContent);
  
  const structuredSuggestions = hasContent ? 
    generatedContent && generatedContent.length > 0 
      ? processContentForDisplay(generatedContent) 
      : rawResponse 
        ? processContentForDisplay(Array.isArray(rawResponse) ? rawResponse : [rawResponse]) 
        : [] 
    : [];
  
  console.log("Structured suggestions:", structuredSuggestions);

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
          <StrategicContentForm />
          
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
          {!isAgentLoading && !isForceProcessing && hasContent && structuredSuggestions.length > 0 && (
            <StructuredContentSuggestions
              key={`suggestions-${forceRerender}`}
              suggestions={structuredSuggestions}
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
                <p className="text-muted-foreground">Generating strategic content suggestions...</p>
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
              processedContent={generatedContent && generatedContent.length > 0 ? generatedContent : (rawResponse ? [rawResponse] : [])}
            />
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
};

export default EnhancedAISuggestionsTab;
