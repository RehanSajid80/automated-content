
import React, { useState } from "react";
import { FileText, Tag, Share2, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContentGeneratorProps, contentTypes } from "./types/content";
import { ContentGeneratorForm } from "./content-creator/ContentGeneratorForm";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import AIContentDisplay from "./AIContentDisplay";
import { Button } from "@/components/ui/button";
import { Copy, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ 
  className, 
  keywords: initialKeywords 
}) => {
  const [activeTab, setActiveTab] = useState("pillar");
  const [keywords, setKeywords] = useState("");
  const [socialContext, setSocialContext] = useState("");
  
  const {
    targetUrl,
    handleSuggestUrl,
    isCheckingExistence,
    setTargetUrl,
  } = useUrlSuggestions();

  const {
    isGenerating,
    generatingProgress,
    generatedContent,
    generateContent,
    setGeneratedContent
  } = useContentGeneration();

  React.useEffect(() => {
    if (initialKeywords && initialKeywords.length > 0) {
      setKeywords(initialKeywords.join(", "));
      setActiveTab("pillar");
      setGeneratedContent("");
    }
  }, [initialKeywords]);

  const handleGenerate = () => {
    generateContent(activeTab, keywords, targetUrl, socialContext);
  };

  const handleSuggestUrlClick = () => {
    handleSuggestUrl(keywords);
  };

  const handleCopyContent = () => {
    try {
      navigator.clipboard.writeText(generatedContent);
      toast.success("Content copied to clipboard");
    } catch (err) {
      console.error("Failed to copy content:", err);
      toast.error("Failed to copy content");
    }
  };

  const handleSaveContent = async () => {
    try {
      // If this is social content, save to the social_posts table
      if (activeTab === 'social') {
        const { data, error } = await supabase
          .from('social_posts')
          .insert([
            {
              content: generatedContent,
              platform: 'linkedin', // Default platform
              title: 'Social Media Post',
              topic_area: 'workspace-management',
              keywords: keywords ? keywords.split(',').map(k => k.trim()) : []
            }
          ]);
          
        if (error) throw error;
        
        toast.success("Social post saved successfully");
        // Refresh other content components
        window.dispatchEvent(new Event("content-updated"));
      } else {
        // Save other content types to content_library
        const { data, error } = await supabase
          .from('content_library')
          .insert([
            {
              content: generatedContent,
              content_type: activeTab,
              title: `Generated ${activeTab} content`,
              topic_area: 'workspace-management',
              is_saved: true,
              keywords: keywords ? keywords.split(',').map(k => k.trim()) : []
            }
          ]);

        if (error) throw error;
        
        toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content saved successfully`);
        // Refresh other content components
        window.dispatchEvent(new Event("content-updated"));
      }
      
      // Clear the generated content after saving
      setGeneratedContent("");
    } catch (err) {
      console.error("Error saving content:", err);
      toast.error("Failed to save content");
    }
  };

  return (
    <div className={cn("", className)}>
      <Tabs defaultValue="pillar" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          {contentTypes.map(type => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="flex items-center"
            >
              {type.id === "pillar" && <FileText size={16} />}
              {type.id === "support" && <Building2 size={16} />}
              {type.id === "meta" && <Tag size={16} />}
              {type.id === "social" && <Share2 size={16} />}
              <span className="ml-2 hidden sm:inline">{type.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {contentTypes.map(type => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            <ContentGeneratorForm
              activeTab={activeTab}
              keywords={keywords}
              targetUrl={targetUrl}
              socialContext={socialContext}
              onKeywordsChange={setKeywords}
              onUrlChange={setTargetUrl}
              onSocialContextChange={setSocialContext}
              onGenerate={handleGenerate}
              onSuggestUrl={handleSuggestUrlClick}
              isGenerating={isGenerating}
              isCheckingUrl={isCheckingExistence}
              generatingProgress={generatingProgress}
            />
            
            {generatedContent && activeTab === type.id && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium">Generated Content</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyContent}>
                      <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                    <Button size="sm" onClick={handleSaveContent}>
                      <Save className="w-4 h-4 mr-2" />
                      {activeTab === 'social' ? 'Save Social Post' : `Save ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content`}
                    </Button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap bg-muted/50 p-4 rounded-md border font-mono text-sm">
                  {generatedContent}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ContentGenerator;
