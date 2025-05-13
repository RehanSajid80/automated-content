
import { useState, useEffect } from "react";
import { useN8nAgent } from "./useN8nAgent";
import { useContentProcessor } from "./useContentProcessor";
import { toast } from "@/components/ui/use-toast";

export const useGeneratedContent = () => {
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
        toast({
          title: "No Content Found",
          description: "The response format might not be as expected.",
          variant: "destructive"
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

  const handleRegenerateContent = async (sectionKey: string, topicArea?: string) => {
    if (!topicArea) {
      toast({
        title: "Topic Area Required",
        description: "Please select a topic area before regenerating content"
      });
      return;
    }
    
    try {
      toast({
        title: "Regenerating Content",
        description: `Regenerating ${sectionKey} content...`
      });
      
      await sendToN8n({
        topicArea,
        requestType: 'contentSuggestions',
        contentType: sectionKey
      });
    } catch (error) {
      console.error("Error regenerating content:", error);
      toast({
        title: "Regeneration Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const forceRender = () => {
    console.log("Forcing re-render");
    setForceRefresh(prev => prev + 1);
  };

  return {
    suggestions,
    generatedContent,
    n8nLoading,
    n8nError,
    isEditing,
    setIsEditing,
    hasDisplayedContent,
    forceRefresh,
    editableContent,
    contentProcessed,
    processingError,
    retryProcessing,
    rawResponse,
    sendToN8n,
    handleContentChange,
    handleRegenerateContent,
    forceRender
  };
};
