import React, { useState, useEffect } from "react";
import { FileText, Tag, Share2, Building2, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ContentGeneratorProps, contentTypes } from "./types/content";
import { ContentGeneratorForm } from "./content-creator/ContentGeneratorForm";
import { useContentGeneration } from "@/hooks/useContentGeneration";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import AIContentDisplay from "./AIContentDisplay";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { toast } from "@/components/ui/use-toast";
import { createContentPayload } from "@/utils/payloadUtils";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import { supabase } from "@/integrations/supabase/client";
import GeneratedContent from "./GeneratedContent";
import { useContentSections } from "@/hooks/useContentSections";

// Update content types with email
const extendedContentTypes = [
  ...contentTypes,
  { id: "email", name: "Email Campaign" }
];

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ 
  className, 
  keywords: initialKeywords 
}) => {
  const [activeTab, setActiveTab] = useState("pillar");
  const [keywords, setKeywords] = useState("");
  const [socialContext, setSocialContext] = useState("");
  const [localContentTitle, setLocalContentTitle] = useState("");
  const [useRAG, setUseRAG] = useState(true); // Default to using RAG
  
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

  // Use the N8N config hook to get the content webhook URL
  const { getContentWebhookUrl } = useN8nConfig();
  
  // Add N8N agent for custom webhook calls
  const { 
    sendToN8n, 
    isLoading: isN8nLoading, 
    generatedContent: n8nContent, 
    contentTitle,
    setGeneratedContent: setN8nContent,
    setContentTitle
  } = useN8nAgent();

  // Use contentSections hook to parse different content types
  const contentSections = useContentSections(n8nContent);

  // Effect to get content webhook URL on component mount
  const [contentWebhookUrl, setContentWebhookUrl] = useState("");
  
  useEffect(() => {
    const webhookUrl = getContentWebhookUrl();
    console.log("Content webhook URL from config:", webhookUrl);
    setContentWebhookUrl(webhookUrl);
  }, []);

  useEffect(() => {
    if (initialKeywords && initialKeywords.length > 0) {
      setKeywords(initialKeywords.join(", "));
      setActiveTab("pillar");
      setGeneratedContent("");
      setN8nContent([]);
    }
  }, [initialKeywords]);

  // Set appropriate content based on active tab and parsed sections
  useEffect(() => {
    if (contentSections && Object.keys(contentSections).length > 0) {
      const sectionContent = contentSections[activeTab];
      if (sectionContent && sectionContent.trim().length > 0) {
        // Set the corresponding content based on active tab
        setGeneratedContent(sectionContent);
      }
    }
  }, [activeTab, contentSections, setGeneratedContent]);

  const handleGenerate = async () => {
    // Get the most current webhook URL
    const currentWebhookUrl = getContentWebhookUrl();
    
    // Create standard content payload
    const payload = createContentPayload({
      content_type: "all", // Request all content types at once
      topic: keywords,
      primary_keyword: keywords,
      related_keywords: keywords,
      tone: "Friendly and informative",
      // Add the target URL to the payload
      target_url: targetUrl,
      url: targetUrl,
      // Add social context if provided
      social_context: socialContext,
      // Add RAG preference
      use_rag: useRAG,
      // Add expected output format instructions
      output_format: {
        pillarContent: "A full article in plain text (1200-1500 words), no HTML. Use clear text headings, examples, and actionable insights.",
        supportContent: "A supplementary article (500-800 words) on a related subtopic or question. Use text-based headings and bullet lists.",
        metaTags: {
          metaTitle: "SEO optimized title (70 characters max)",
          metaDescription: "Compelling meta description (150-160 characters)"
        },
        socialPosts: "4-5 social media posts with emojis, CTAs, and suggested posting times",
        emailCampaign: {
          subjectLines: "3-5 compelling email subject lines",
          emails: "2-3 short email body texts (100-150 words each) with personalization tokens"
        }
      }
    });

    try {
      toast({
        title: "Generating Content",
        description: "Using n8n AI agent webhook connection"
      });

      console.log("Using content webhook URL:", currentWebhookUrl);
      console.log(`Generating all content types for topic: ${keywords}`);
      
      const result = await sendToN8n({
        customPayload: payload
      }, true); // Changed from currentWebhookUrl to true to use content webhook

      // Check if we got a response with content
      if (result && result.content && result.content.length > 0) {
        // Update the generated content based on active tab
        if (contentSections && contentSections[activeTab]) {
          setGeneratedContent(contentSections[activeTab]);
        } else {
          // Fallback to first content item if sections not parsed
          setGeneratedContent(result.content[0].output || "");
        }
        
        // Update the content title if available
        if (result.title) {
          setContentTitle(result.title);
          setLocalContentTitle(result.title);
        } else if (result.content[0].title) {
          setContentTitle(result.content[0].title);
          setLocalContentTitle(result.content[0].title);
        }
      } else if (result && result.rawResponse) {
        // Try to use raw response if no formatted content
        setGeneratedContent(result.rawResponse);
      }
    } catch (error) {
      console.error("Error calling n8n webhook:", error);
      toast({
        title: "Error Generating Content",
        description: "Failed to generate content through the webhook. Trying standard method...",
        variant: "destructive"
      });
      // Fall back to standard content generation
      generateContent(activeTab, keywords, targetUrl, socialContext);
    }
  };

  const handleSuggestUrlClick = () => {
    handleSuggestUrl(keywords);
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setGeneratedContent(newContent);
  };

  // Handle content save
  const handleSaveContent = async () => {
    try {
      if (!generatedContent || generatedContent.trim().length === 0) {
        toast({
          title: "No Content to Save",
          description: "Please generate content first",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`ContentGenerator: Saving content with type: ${activeTab}`);
      
      // Use the generated title or create a default one
      const titleToUse = contentTitle || localContentTitle || `Generated ${activeTab} content`;
      
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content: generatedContent,
            content_type: activeTab, // Use the current active tab as content type
            is_saved: true,
            title: titleToUse,
            topic_area: 'workspace-management',
            keywords: keywords.split(',').map(k => k.trim())
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      console.log('ContentGenerator: Content saved successfully');
      
      // Dispatch event to notify other components about content update
      window.dispatchEvent(new CustomEvent('content-updated'));
      
      toast({
        title: "Content Saved",
        description: `Your ${activeTab} content has been saved to the library`,
      });
    } catch (error) {
      console.error('Error in content save handler:', error);
      toast({
        title: "Error Saving Content",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={cn("", className)}>
      <Tabs defaultValue="pillar" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          {extendedContentTypes.map(type => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="flex items-center"
            >
              {type.id === "pillar" && <FileText size={16} />}
              {type.id === "support" && <Building2 size={16} />}
              {type.id === "meta" && <Tag size={16} />}
              {type.id === "social" && <Share2 size={16} />}
              {type.id === "email" && <Mail size={16} />}
              <span className="ml-2 hidden sm:inline">{type.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {extendedContentTypes.map(type => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            <ContentGeneratorForm
              activeTab={activeTab}
              keywords={keywords}
              targetUrl={targetUrl}
              socialContext={socialContext}
              useRAG={useRAG}
              onKeywordsChange={setKeywords}
              onUrlChange={setTargetUrl}
              onSocialContextChange={setSocialContext}
              onRAGToggle={setUseRAG}
              onGenerate={handleGenerate}
              onSuggestUrl={handleSuggestUrlClick}
              isGenerating={isGenerating || isN8nLoading}
              isCheckingUrl={isCheckingExistence}
              generatingProgress={isN8nLoading ? `Generating all content types via n8n AI agent... (${contentWebhookUrl ? "Webhook configured" : "Using default webhook"})` : generatingProgress}
            />
            
            {generatedContent && activeTab === type.id && (
              <GeneratedContent
                content={generatedContent}
                onContentChange={handleContentChange}
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
