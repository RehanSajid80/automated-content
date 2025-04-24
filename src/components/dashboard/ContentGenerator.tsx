
import React, { useState } from "react";
import { FileText, Tag, Share2, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { generateContentByType } from "@/utils/contentGenerationUtils";
import { toast } from "sonner";
import { ContentGeneratorProps, contentTypes } from "./types/content";
import ContentGenerationForm from "./ContentGenerationForm";
import GeneratedContent from "./GeneratedContent";

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ className, keywords: initialKeywords }) => {
  const [activeTab, setActiveTab] = useState("pillar");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  
  React.useEffect(() => {
    if (initialKeywords && initialKeywords.length > 0) {
      setKeywords(initialKeywords.join(", "));
      setActiveTab("pillar");
      setGeneratedContent("");
    }
  }, [initialKeywords]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    if (activeTab === "pillar") {
      setGeneratingProgress("Generating comprehensive pillar content (this may take a minute)...");
    } else {
      setGeneratingProgress("Generating content...");
    }
    
    try {
      const mainKeyword = keywords.split(',')[0]?.trim() || "";
      const contentType = activeTab;
      
      let minWords;
      if (contentType === 'pillar') {
        minWords = 1500;
        toast.info("Generating pillar content", {
          description: "Creating comprehensive content of at least 1200 words. This may take a minute...",
          duration: 5000,
        });
      }
      
      let progressDots = 0;
      let progressInterval: number | null = null;
      
      if (contentType === 'pillar') {
        progressInterval = window.setInterval(() => {
          progressDots = (progressDots + 1) % 4;
          const dots = '.'.repeat(progressDots);
          setGeneratingProgress(`Creating comprehensive ${mainKeyword} guide${dots} This may take a minute.`);
        }, 500);
      }
      
      const generatedResult = await generateContentByType({
        contentType,
        mainKeyword,
        keywords: keywords.split(',').map(k => k.trim()),
        minWords
      });
      
      if (progressInterval !== null) {
        clearInterval(progressInterval);
      }
      
      setGeneratedContent(generatedResult);
      
      const wordCount = generatedResult.split(/\s+/).filter(word => word.length > 0).length;
      
      if (contentType === 'pillar') {
        toast.success(`Content generated successfully!`, {
          description: `Created a ${wordCount.toLocaleString()} word guide on ${mainKeyword}`,
        });
      } else {
        toast.success("Content generated successfully!");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
      setGeneratingProgress("");
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
            <ContentGenerationForm
              activeTab={activeTab}
              keywords={keywords}
              onKeywordsChange={setKeywords}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              generatingProgress={generatingProgress}
              contentType={type}
            />
            
            {generatedContent && activeTab === type.id && (
              <GeneratedContent
                content={generatedContent}
                onContentChange={setGeneratedContent}
                activeTab={activeTab}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ContentGenerator;
