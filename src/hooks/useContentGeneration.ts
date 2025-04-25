
import { useState } from "react";
import { generateContentByType } from "@/utils/contentGenerationUtils";
import { toast } from "sonner";

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingProgress, setGeneratingProgress] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");

  const generateContent = async (activeTab: string, keywords: string) => {
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

  return {
    isGenerating,
    generatingProgress,
    generatedContent,
    generateContent,
    setGeneratedContent
  };
};
