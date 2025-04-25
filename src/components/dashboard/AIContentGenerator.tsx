
import React, { useState, useEffect } from "react";
import { AIContentGeneratorProps } from "./types/aiSuggestions";
import { AISuggestionsList } from "./AISuggestionsList";
import AIContentDisplay from "./AIContentDisplay";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { useContentProcessor } from "@/hooks/useContentProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Loader2, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "./content-creator/LoadingState";
import { ProcessingError } from "./content-creator/ProcessingError";
import { ContentEditor } from "./content-creator/ContentEditor";

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  keywords,
  topicArea,
  onSuggestionSelect,
  isLoading
}) => {
  const { 
    suggestions, 
    generatedContent, 
    sendToN8n, 
    isLoading: n8nLoading, 
    error: n8nError,
    rawResponse
  } = useN8nAgent();
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hasDisplayedContent, setHasDisplayedContent] = useState<boolean>(false);
  const [forceRefresh, setForceRefresh] = useState<number>(0);
  
  const {
    editableContent,
    contentProcessed,
    processingError,
    retryProcessing,
    setEditableContent
  } = useContentProcessor(generatedContent);

  // Debug log generatedContent changes
  useEffect(() => {
    console.log("AIContentGenerator: generatedContent updated:", generatedContent);
    console.log("Number of content items:", generatedContent?.length || 0);
    if (generatedContent && generatedContent.length > 0) {
      console.log("First content item:", generatedContent[0]);
    }
  }, [generatedContent]);

  // Check if we have content to display when content is processed
  useEffect(() => {
    if (contentProcessed && generatedContent?.length > 0) {
      console.log("Content is processed, editableContent:", editableContent);
      const hasContent = Object.values(editableContent).some(content => content && content.trim().length > 0);
      if (hasContent) {
        setHasDisplayedContent(true);
        console.log("Content is available for display");
      } else {
        console.log("No content to display despite being processed");
        toast.error("No content found in the response", {
          description: "The response format might not be as expected."
        });
      }
    }
  }, [contentProcessed, editableContent, generatedContent]);

  // Log when raw content is available
  useEffect(() => {
    if (rawResponse) {
      console.log("Raw response available:", typeof rawResponse === 'string' ? 
        `${rawResponse.substring(0, 100)}... (${rawResponse.length} chars)` : 
        "Non-string response");
    }
  }, [rawResponse]);

  const handleContentChange = (sectionKey: string, newContent: string) => {
    setEditableContent(prev => ({
      ...prev,
      [sectionKey]: newContent
    }));
  };

  const handleRegenerateContent = async (sectionKey: string) => {
    if (!topicArea) {
      toast("Topic area required", {
        description: "Please select a topic area before regenerating content"
      });
      return;
    }
    
    try {
      toast("Regenerating content", {
        description: `Regenerating ${sectionKey} content...`
      });
      
      await sendToN8n({
        keywords: keywords,
        topicArea,
        targetUrl: "https://www.officespacesoftware.com",
        url: "https://www.officespacesoftware.com",
        requestType: 'contentSuggestions',
        contentType: sectionKey
      });
    } catch (error) {
      console.error("Error regenerating content:", error);
      toast.error("Failed to regenerate content", {
        description: "Please try again."
      });
    }
  };

  const handleSaveContent = async (sectionKey: string) => {
    try {
      const contentToSave = editableContent[sectionKey];
      
      if (!contentToSave || contentToSave.trim().length === 0) {
        toast.error("No content to save", {
          description: "The content section is empty"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content_type: sectionKey,
            content: contentToSave,
            title: `Generated ${sectionKey} content`,
            topic_area: topicArea || 'general',
            is_saved: true
          }
        ])
        .select();

      if (error) throw error;

      toast.success("Content saved", {
        description: `Your ${sectionKey} content has been saved to the library`
      });
      
      // Dispatch event to notify other components about content update
      window.dispatchEvent(new CustomEvent('content-updated'));

    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Error saving content", {
        description: "Please try again or contact support"
      });
    }
  };

  const forceRender = () => {
    console.log("Forcing re-render");
    setForceRefresh(prev => prev + 1);
  };

  if (isLoading || n8nLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
        <LoadingState message="Generating content..." />
      </div>
    );
  }

  if (generatedContent && generatedContent.length > 0 && !contentProcessed) {
    return (
      <div className="mt-6">
        <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
        <LoadingState 
          message="Processing content..." 
          submessage="Content received, parsing sections..."
        />
      </div>
    );
  }

  if (processingError) {
    return (
      <div className="mt-6">
        <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
        <ProcessingError 
          error={processingError}
          onRetry={retryProcessing}
        />
      </div>
    );
  }

  // Debug display the content for troubleshooting
  const debugDisplayContent = () => {
    if (generatedContent && generatedContent.length > 0) {
      try {
        const contentItem = generatedContent[0];
        const output = contentItem.output || contentItem.content || JSON.stringify(contentItem);
        return (
          <div className="p-4 mb-4 bg-slate-50 dark:bg-slate-900 border rounded overflow-auto">
            <h4 className="text-sm font-medium mb-2">Raw Content Preview:</h4>
            <p className="text-xs font-mono whitespace-pre-line">
              {output.substring(0, 300)}...
            </p>
          </div>
        );
      } catch (e) {
        return <p>Error displaying debug content: {String(e)}</p>;
      }
    }
    return null;
  };

  return (
    <div className="mt-6">
      <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
      
      {suggestions && suggestions.length > 0 && (
        <div className="mb-6">
          <AISuggestionsList 
            suggestions={suggestions}
            onSelect={onSuggestionSelect}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {generatedContent && generatedContent.length > 0 && contentProcessed && (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Generated Content</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={forceRender}
                title="Force refresh content display"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Pencil className="h-4 w-4" />
                {isEditing ? "View Overview" : "Edit Content"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Debug display content */}
            {debugDisplayContent()}
            
            {isEditing ? (
              <ContentEditor
                editableContent={editableContent}
                onContentChange={handleContentChange}
                onRegenerateContent={handleRegenerateContent}
                onSaveContent={handleSaveContent}
              />
            ) : (
              <React.Fragment key={`content-display-${forceRefresh}`}>
                <AIContentDisplay content={generatedContent} onClose={() => {}} />
              </React.Fragment>
            )}
          </CardContent>
        </Card>
      )}
      
      {n8nError && (!generatedContent || generatedContent.length === 0) && (
        <ProcessingError 
          error={n8nError}
          onRetry={() => {}}
        />
      )}
      
      {(!generatedContent || generatedContent.length === 0) && !n8nError && suggestions.length === 0 && (
        <div className="p-4 text-center border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No content generated yet.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your keywords or topic area and generate content again.
          </p>
        </div>
      )}
    </div>
  );
};
