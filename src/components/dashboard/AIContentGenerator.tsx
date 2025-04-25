
import React, { useState } from "react";
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
import { Pencil } from "lucide-react";

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  keywords,
  topicArea,
  onSuggestionSelect,
  isLoading
}) => {
  const { suggestions, generatedContent, sendToN8n } = useN8nAgent();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [editableContent, setEditableContent] = useState<{[key: string]: string}>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Initialize editable content when generatedContent changes
  React.useEffect(() => {
    if (generatedContent.length > 0) {
      const output = generatedContent[0].output || "";
      
      // Parse different sections
      const sections = {
        pillar: output.split("### Support Content")[0] || "",
        support: output.split("### Support Content")[1]?.split("### Meta Tags")[0] || "",
        meta: output.split("### Meta Tags")[1]?.split("### Social Media Posts")[0] || "",
        social: output.split("### Social Media Posts")[1] || ""
      };
      
      setEditableContent(sections);
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

  if (suggestions.length === 0 && generatedContent.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
        <AISuggestionsList 
          suggestions={[]}
          onSelect={onSuggestionSelect}
          isLoading={isLoading}
        />
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
      
      {generatedContent.length > 0 && (
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
