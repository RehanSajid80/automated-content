
import React, { useState } from "react";
import { FileText, Tag, Share2, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContentGeneratorProps, contentTypes } from "./types/content";
import { ContentGeneratorForm } from "./content-creator/ContentGeneratorForm";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import AIContentDisplay from "./AIContentDisplay";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { toast } from "@/hooks/use-toast";
import { createContentPayload, CONTENT_WEBHOOK_URL } from "@/utils/payloadUtils";

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

  // Add N8N agent for custom webhook calls
  const { sendToN8n, isLoading: isN8nLoading, generatedContent: n8nContent, setGeneratedContent: setN8nContent } = useN8nAgent();

  React.useEffect(() => {
    if (initialKeywords && initialKeywords.length > 0) {
      setKeywords(initialKeywords.join(", "));
      setActiveTab("pillar");
      setGeneratedContent("");
      setN8nContent([]);
    }
  }, [initialKeywords]);

  const handleGenerate = async () => {
    // Create standard content payload
    const payload = createContentPayload({
      content_type: activeTab,
      topic: keywords,
      primary_keyword: keywords,
      related_keywords: keywords,
      tone: "Friendly and informative",
    });

    try {
      toast.success("Generating Content", {
        description: "This may take a moment"
      });

      const result = await sendToN8n({
        customPayload: payload
      }, CONTENT_WEBHOOK_URL);
      
      // Check if we got a response with content
      if (result && result.content && result.content.length > 0) {
        // Update the generated content
        setGeneratedContent(result.content[0].output || "");
      } else if (result && result.rawResponse) {
        // Try to use raw response if no formatted content
        setGeneratedContent(result.rawResponse);
      }
    } catch (error) {
      console.error("Error calling n8n webhook:", error);
      toast.error("Error Generating Content", {
        description: "Failed to generate content through the webhook. Trying standard method...",
      });
      // Fall back to standard content generation
      generateContent(activeTab, keywords, targetUrl, socialContext);
    }
  };

  const handleSuggestUrlClick = () => {
    handleSuggestUrl(keywords);
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
              isGenerating={isGenerating || isN8nLoading}
              isCheckingUrl={isCheckingExistence}
              generatingProgress={isN8nLoading ? "Generating content via webhook..." : generatingProgress}
            />
            
            {generatedContent && activeTab === type.id && (
              <AIContentDisplay
                content={[{ output: generatedContent }]}
                onClose={() => setGeneratedContent("")}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ContentGenerator;
