
import React, { useState } from "react";
import { FileText, Tag, Share2, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContentGeneratorProps, contentTypes } from "./types/content";
import { ContentGeneratorForm } from "./content-creator/ContentGeneratorForm";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import AIContentDisplay from "./AIContentDisplay";

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
