
import React, { useState, useEffect } from "react";
import { AIContentGeneratorProps } from "./types/aiSuggestions";
import { AISuggestionsList } from "./AISuggestionsList";
import AIContentDisplay from "./AIContentDisplay";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GeneratedContentCard } from "./content-creator/GeneratedContentCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  keywords,
  topicArea,
  onSuggestionSelect,
  isLoading
}) => {
  const { suggestions, generatedContent, rawResponse, sendToN8n, isLoading: n8nLoading, error: n8nError } = useN8nAgent();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableContent, setEditableContent] = useState<{[key: string]: string}>({});
  const [contentProcessed, setContentProcessed] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Debug logs for tracking state changes
  useEffect(() => {
    console.log("AIContentGenerator: generatedContent updated:", generatedContent);
    console.log("AIContentGenerator: suggestions updated:", suggestions);
    console.log("AIContentGenerator: rawResponse:", rawResponse);
  }, [generatedContent, suggestions, rawResponse]);

  // Initialize editable content when generatedContent changes
  useEffect(() => {
    if (generatedContent.length > 0) {
      console.log("Processing generatedContent:", generatedContent);
      setProcessingError(null);
      
      try {
        // Get the first content item
        const contentItem = generatedContent[0];
        console.log("Processing content item:", contentItem);
        
        // Make sure we have an output property
        const output = contentItem.output || contentItem.content || "";
        if (!output) {
          console.error("No output content found in:", contentItem);
          setProcessingError("No content found in the response");
          return;
        }
        
        console.log("Processing output content:", output.substring(0, 100) + "...");
        
        // Attempt to parse different sections
        try {
          // Check if output contains section markers
          const hasSections = output.includes("### Support Content") || 
                             output.includes("### Meta Tags") || 
                             output.includes("### Social Media Posts");
          
          let sections = {};
          
          if (hasSections) {
            console.log("Found section markers, parsing sections");
            sections = {
              pillar: output.split("### Support Content")[0] || "",
              support: output.split("### Support Content")[1]?.split("### Meta Tags")[0] || "",
              meta: output.split("### Meta Tags")[1]?.split("### Social Media Posts")[0] || "",
              social: output.split("### Social Media Posts")[1] || ""
            };
          } else {
            console.log("No section markers found, using full output as pillar content");
            sections = {
              pillar: output,
              support: "",
              meta: "",
              social: ""
            };
          }
          
          console.log("Parsed content sections:", sections);
          setEditableContent(sections);
          setContentProcessed(true);
        } catch (sectionError) {
          console.error("Error parsing content sections:", sectionError);
          // If section parsing fails, store the whole content in pillar
          setEditableContent({
            pillar: output,
            support: "",
            meta: "",
            social: ""
          });
          setContentProcessed(true);
        }
      } catch (error) {
        console.error("Error processing content:", error);
        setProcessingError("Error processing content. Please try again.");
        setContentProcessed(false);
      }
    }
  }, [generatedContent]);

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
      setContentProcessed(false);
      
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
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Processing your content...</span>
        </div>
      </div>
    );
  }

  // Check for new content that hasn't been processed yet
  if (generatedContent.length > 0 && !contentProcessed) {
    return (
      <div className="mt-6">
        <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
        <div className="p-8 flex flex-col justify-center items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-3"></div>
          <span>Processing content...</span>
          <span className="text-sm text-muted-foreground mt-1">
            Content received, parsing sections...
          </span>
        </div>
      </div>
    );
  }

  // Show error if there was a processing error
  if (processingError) {
    return (
      <div className="mt-6">
        <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Processing Content</AlertTitle>
          <AlertDescription>
            {processingError}
            <div className="mt-2">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  if (generatedContent.length > 0) {
                    // Force retry content processing
                    const content = [...generatedContent];
                    // These lines had the error - we need to use the setContentProcessed from useState
                    setContentProcessed(false);
                    setTimeout(() => setContentProcessed(true), 100);
                  }
                }}
              >
                Retry Processing
              </Button>
            </div>
          </AlertDescription>
        </Alert>
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
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{n8nError}</AlertDescription>
          </Alert>
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
              <Tabs defaultValue="pillar">
                <TabsList>
                  <TabsTrigger value="pillar">Pillar Content</TabsTrigger>
                  <TabsTrigger value="support">Support Content</TabsTrigger>
                  <TabsTrigger value="meta">Meta Tags</TabsTrigger>
                  <TabsTrigger value="social">Social Posts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pillar">
                  <GeneratedContentCard
                    content={editableContent.pillar || ""}
                    onContentChange={(content) => handleContentChange('pillar', content)}
                    onRegenerateContent={() => handleRegenerateContent('pillar')}
                    onSaveContent={() => handleSaveContent('pillar')}
                    contentType="pillar"
                  />
                </TabsContent>
                
                <TabsContent value="support">
                  <GeneratedContentCard
                    content={editableContent.support || ""}
                    onContentChange={(content) => handleContentChange('support', content)}
                    onRegenerateContent={() => handleRegenerateContent('support')}
                    onSaveContent={() => handleSaveContent('support')}
                    contentType="support"
                  />
                </TabsContent>
                
                <TabsContent value="meta">
                  <GeneratedContentCard
                    content={editableContent.meta || ""}
                    onContentChange={(content) => handleContentChange('meta', content)}
                    onRegenerateContent={() => handleRegenerateContent('meta')}
                    onSaveContent={() => handleSaveContent('meta')}
                    contentType="meta"
                  />
                </TabsContent>
                
                <TabsContent value="social">
                  <GeneratedContentCard
                    content={editableContent.social || ""}
                    onContentChange={(content) => handleContentChange('social', content)}
                    onRegenerateContent={() => handleRegenerateContent('social')}
                    onSaveContent={() => handleSaveContent('social')}
                    contentType="social"
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <AIContentDisplay content={generatedContent} onClose={() => {}} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
