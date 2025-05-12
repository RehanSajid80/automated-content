
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
import { toast } from "sonner";

// Sample chat history for the content generation API
const sampleChatHistory = [
  {
    userInstruction: "Man in dress shirt in office",
    dallePrompt: "A young man wearing a dress shirt sitting in a modern office with warm lighting",
    imageUrl: "https://example.com/image1.png"
  },
  {
    userInstruction: "Add a briefcase on the desk",
    dallePrompt: "Same scene with a briefcase on the desk in front of the man",
    imageUrl: "https://example.com/image2.png"
  }
];

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
    // Prepare payload based on the content type
    if (activeTab === "social" || activeTab === "pillar") {
      // For social and pillar content, use the n8n webhook
      try {
        // Custom webhook for content generation
        const webhookUrl = "https://analyzelens.app.n8n.cloud/webhook/d9b7f2f7-1140-48a6-85dc-aee39fc6e5b4";
        
        // Create the payload as per the required format
        const payload = {
          customPayload: {
            chatHistory: sampleChatHistory,
            currentInstruction: keywords || "Generate content for " + activeTab,
            currentImageUrl: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-tlJCBu737SBDlLq8U7QqucI8/user-0Xpsy7HWO3GknjpUaMh05Bim/img-XIJxZpWSGQzrSFcVuiF6Lk5e.png?st=2025-05-01T13%3A35%3A14Z&se=2025-05-01T15%3A35%3A14Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=cc612491-d948-4d2e-9821-2683df3719f5&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-05-01T01%3A28%3A06Z&ske=2025-05-02T01%3A28%3A06Z&sks=b&skv=2024-08-04&sig=GUwV4Zvr2HgTzYxHBJSYeyKsvQs2n7Gy5h0zxPwpI0s%3D"
          }
        };

        toast.info("Generating content via n8n webhook...", {
          description: "This may take a moment"
        });

        const result = await sendToN8n(payload, webhookUrl);
        
        // Check if we got a response with content
        if (result && result.rawResponse) {
          try {
            const data = JSON.parse(result.rawResponse);
            if (data.content) {
              // Update the generated content in the ContentGeneration hook
              setGeneratedContent(data.content);
            }
          } catch (error) {
            console.error("Error parsing n8n webhook response:", error);
          }
        }
      } catch (error) {
        console.error("Error calling n8n webhook:", error);
        toast.error("Error generating content", {
          description: "Failed to generate content through the webhook. Trying standard method..."
        });
        // Fall back to standard content generation
        generateContent(activeTab, keywords, targetUrl, socialContext);
      }
    } else {
      // For other content types, use the standard content generation
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
