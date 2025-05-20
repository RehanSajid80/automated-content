
import React from "react";
import { AIContentGeneratorProps } from "./types/aiSuggestions";
import { AISuggestionsList } from "./AISuggestionsList";
import { useGeneratedContent } from "@/hooks/useGeneratedContent";
import { LoadingState } from "./content-creator/LoadingState";
import { ProcessingError } from "./content-creator/ProcessingError";
import { ContentGenerationHeader } from "./content-display/ContentGenerationHeader";
import { ContentDisplay } from "./content-display/ContentDisplay";
import { EmptyState } from "./content-display/EmptyState";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  keywords,
  topicArea,
  onSuggestionSelect,
  isLoading
}) => {
  const {
    suggestions,
    generatedContent,
    n8nLoading,
    n8nError,
    isEditing,
    setIsEditing,
    forceRefresh,
    editableContent,
    contentProcessed,
    processingError,
    retryProcessing,
    handleContentChange,
    handleRegenerateContent,
    forceRender
  } = useGeneratedContent();

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

      console.log('AIContentGenerator: Content saved successfully, dispatching content-updated event');
      
      // Dispatch event to notify other components about content update
      window.dispatchEvent(new CustomEvent('content-updated'));

      toast.success("Content saved", {
        description: `Your ${sectionKey} content has been saved to the library`
      });

    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Error saving content", {
        description: "Please try again or contact support"
      });
    }
  };

  if (isLoading || n8nLoading) {
    return (
      <div className="mt-6">
        <ContentGenerationHeader isLoading={true} />
        <LoadingState message="Generating content..." />
      </div>
    );
  }

  if (generatedContent && generatedContent.length > 0 && !contentProcessed) {
    return (
      <div className="mt-6">
        <ContentGenerationHeader isLoading={false} />
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
        <ContentGenerationHeader isLoading={false} />
        <ProcessingError 
          error={processingError}
          onRetry={retryProcessing}
        />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <ContentGenerationHeader isLoading={false} />
      
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
        <ContentDisplay 
          generatedContent={generatedContent}
          editableContent={editableContent}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          forceRefresh={forceRefresh}
          handleContentChange={handleContentChange}
          handleRegenerateContent={(sectionKey) => handleRegenerateContent(sectionKey, topicArea)}
          handleSaveContent={handleSaveContent}
          forceRender={forceRender}
        />
      )}
      
      {n8nError && (!generatedContent || generatedContent.length === 0) && (
        <ProcessingError 
          error={n8nError}
          onRetry={retryProcessing}
        />
      )}
      
      <EmptyState suggestions={suggestions} n8nError={n8nError} />
    </div>
  );
};
