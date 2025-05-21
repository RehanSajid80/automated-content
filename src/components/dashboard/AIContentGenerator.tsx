
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
      
      console.log(`AIContentGenerator: Saving content with type: ${sectionKey}`);
      
      // Get title from the first few words of content or generate a default title
      let title = `Generated ${sectionKey} content`;
      
      // Try to extract a meaningful title from the content
      if (sectionKey === 'pillar') {
        // For pillar content, try to find the first heading
        const headingMatch = contentToSave.match(/^#\s+(.+)$/m);
        if (headingMatch && headingMatch[1]) {
          title = headingMatch[1];
        } else {
          // Fallback to first line
          const firstLine = contentToSave.split('\n')[0]?.trim();
          if (firstLine && firstLine.length > 5) {
            title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
          }
        }
      } else if (sectionKey === 'social') {
        // For social posts, use the first sentence
        const firstSentence = contentToSave.split('.')[0]?.trim();
        if (firstSentence && firstSentence.length > 5) {
          title = firstSentence.length > 50 ? firstSentence.substring(0, 50) + '...' : firstSentence;
        }
      }
      
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content_type: sectionKey, // Ensure we use the correct section key as the content_type
            content: contentToSave,
            title: title,
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
