
import React, { useState } from "react";
import { AIContentGeneratorProps } from "./types/aiSuggestions";
import { AISuggestionsList } from "./AISuggestionsList";
import AIContentDisplay from "./AIContentDisplay";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { useContentProcessor } from "@/hooks/useContentProcessor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
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
  const { suggestions, generatedContent, sendToN8n, isLoading: n8nLoading, error: n8nError } = useN8nAgent();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const {
    editableContent,
    contentProcessed,
    processingError,
    retryProcessing,
    setEditableContent
  } = useContentProcessor(generatedContent);

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
      await sendToN8n({
        keywords: keywords,
        topicArea,
        targetUrl: "https://www.officespacesoftware.com",
        url: "https://www.officespacesoftware.com",
        requestType: 'contentSuggestions',
        contentType: sectionKey
      });
      
      toast("Regeneration requested", {
        description: `Regenerating ${sectionKey} content...`
      });
    } catch (error) {
      console.error("Error regenerating content:", error);
      toast("Error", {
        description: "Failed to regenerate content. Please try again.",
        style: { backgroundColor: 'red', color: 'white' }
      });
    }
  };

  const handleSaveContent = async (sectionKey: string) => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content_type: sectionKey,
            content: editableContent[sectionKey],
            title: `Generated ${sectionKey} content`,
            topic_area: topicArea,
            is_saved: true
          }
        ])
        .single();

      if (error) throw error;

      toast("Content saved", {
        description: `Your ${sectionKey} content has been saved to the library`
      });

    } catch (error) {
      console.error('Error saving content:', error);
      toast("Error saving content", {
        description: "Please try again or contact support",
        style: { backgroundColor: 'red', color: 'white' }
      });
    }
  };

  if (isLoading || n8nLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
        <LoadingState />
      </div>
    );
  }

  if (generatedContent.length > 0 && !contentProcessed) {
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

  if (suggestions.length === 0 && generatedContent.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
        <AISuggestionsList 
          suggestions={[]}
          onSelect={onSuggestionSelect}
          isLoading={isLoading}
        />
        
        {n8nError && (
          <ProcessingError 
            error={n8nError}
            onRetry={() => {}}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
      
      {suggestions.length > 0 && (
        <div className="mb-6">
          <AISuggestionsList 
            suggestions={suggestions}
            onSelect={onSuggestionSelect}
            isLoading={isLoading}
          />
        </div>
      )}
      
      {generatedContent.length > 0 && contentProcessed && (
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Generated Content</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil className="h-4 w-4" />
              {isEditing ? "View Overview" : "Edit Content"}
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <ContentEditor
                editableContent={editableContent}
                onContentChange={handleContentChange}
                onRegenerateContent={handleRegenerateContent}
                onSaveContent={handleSaveContent}
              />
            ) : (
              <AIContentDisplay content={generatedContent} onClose={() => {}} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
