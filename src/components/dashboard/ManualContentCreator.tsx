
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ContentForm, ContentFormData } from "./content-creator/ContentForm";
import { GeneratedContentCard } from "./content-creator/GeneratedContentCard";
import { contentTypes } from "@/data/contentTypes";
import { authorPersonas } from "@/data/authorPersonas";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { createContentPayload } from "@/utils/payloadUtils";
import { useN8nConfig } from "@/hooks/useN8nConfig";

interface ManualContentCreatorProps {
  className?: string;
}

const ManualContentCreator: React.FC<ManualContentCreatorProps> = ({ className }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [currentContentType, setCurrentContentType] = useState("pillar");
  const [lastFormData, setLastFormData] = useState<ContentFormData | null>(null);
  const [contentWebhookUrl, setContentWebhookUrl] = useState("");
  
  // Add N8N agent for webhook calls
  const { sendToN8n, isLoading: isN8nLoading } = useN8nAgent();
  
  // Use the N8N config hook to get the content webhook URL
  const { getContentWebhookUrl } = useN8nConfig();
  
  // Effect to get content webhook URL on component mount
  useEffect(() => {
    const webhookUrl = getContentWebhookUrl();
    console.log("Manual Creator: Content webhook URL from config:", webhookUrl);
    setContentWebhookUrl(webhookUrl);
  }, []);
  
  const handleFormSubmit = async (data: ContentFormData) => {
    setIsGenerating(true);
    setGeneratedContent("");
    setCurrentContentType(data.contentType);
    setLastFormData(data);
    
    try {
      // Get the most current webhook URL
      const currentWebhookUrl = getContentWebhookUrl();
      console.log("Using content webhook URL for generation:", currentWebhookUrl);
      
      // Create standard content payload
      const payload = createContentPayload({
        content_type: data.contentType,
        topic: data.keywords,
        primary_keyword: data.keywords,
        related_keywords: data.keywords,
        tone: data.tone || "Friendly and informative",
        goal: data.context || "",
        brand_voice: "Health-focused, educational"
      });
      
      const selectedAuthor = authorPersonas.find(a => a.id === data.author);
      const selectedType = contentTypes.find(t => t.id === data.contentType);
      
      toast.info("Generating content via n8n AI agent...", {
        description: `Creating ${selectedType?.name || data.contentType} content using webhook connection`
      });
  
      const result = await sendToN8n({
        customPayload: payload
      }, currentWebhookUrl);
      
      // Check if we got a response with content
      if (result && result.content && result.content.length > 0) {
        // Update the generated content
        setGeneratedContent(result.content[0].output || "");
      } else if (result && result.rawResponse) {
        // Try to use raw response if no formatted content
        setGeneratedContent(result.rawResponse);
      } else {
        // Fallback to mock content if no response from API
        generateMockContent(data);
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content through n8n webhook", {
        description: "Using fallback content generator..."
      });
      
      // Fallback to mock content
      generateMockContent(data);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Fallback function to generate mock content if API fails
  const generateMockContent = (data: ContentFormData) => {
    const selectedAuthor = authorPersonas.find(a => a.id === data.author);
    const selectedType = contentTypes.find(t => t.id === data.contentType);
    
    // Create mock generated content based on inputs
    let content = "";
    if (data.contentType === "pillar") {
      content = `# The Complete Guide to ${data.keywords}\n\n## Introduction\nOptimizing office space is critical for modern businesses looking to maximize productivity...\n\n## Key Benefits\n1. Improved space utilization\n2. Enhanced employee satisfaction\n3. Reduced operational costs\n\n## Best Practices\nImplementing effective workspace management requires a strategic approach...`;
    } else if (data.contentType === "support") {
      content = `# How to Use Our ${data.keywords} Features\n\n## Getting Started\n1. Set up your floor plans\n2. Import employee data\n3. Configure booking rules\n\n## Troubleshooting\nIf you encounter issues with reservations...`;
    } else if (data.contentType === "meta") {
      content = `Title: Ultimate ${data.keywords} Guide: Optimize Your Workplace in 2024\n\nMeta Description: Discover how our ${data.keywords} solutions can transform your workplace management. Learn about key features, ROI, and implementation strategies.`;
    } else {
      content = `LinkedIn:\n🏢 Struggling with office space efficiency? Our ${data.keywords} just analyzed data from 1000+ companies. Here's what works:\n\n✅ Flexible seating arrangements\n✅ Data-driven space allocation\n✅ Integrated booking systems\n\nLearn more: [link]`;
    }
    
    setGeneratedContent(content);
  };

  const handleSaveContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content: generatedContent,
            content_type: currentContentType,
            is_saved: true,
            title: `Generated ${currentContentType} content`,
            topic_area: 'workspace-management',
            keywords: []
          }
        ])
        .select()
        .single();

      if (error) throw error;

      window.dispatchEvent(new Event('content-updated'));
      toast.success("Content saved successfully!", {
        description: `Your ${currentContentType} content has been saved to the library`
      });

    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Failed to save content", {
        description: "Please try again or contact support if the issue persists"
      });
    }
  };
  
  const handleRegenerateContent = () => {
    if (lastFormData) {
      handleFormSubmit(lastFormData);
    } else {
      toast.error("No previous content generation data found", {
        description: "Please fill the form and generate content first"
      });
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500", className)}>
      <h3 className="text-lg font-semibold mb-6">Manual Content Creator</h3>
      
      <ContentForm 
        onSubmit={handleFormSubmit}
        isGenerating={isGenerating || isN8nLoading}
      />
      
      {generatedContent && (
        <GeneratedContentCard
          content={generatedContent}
          onContentChange={setGeneratedContent}
          onRegenerateContent={handleRegenerateContent}
          onSaveContent={handleSaveContent}
          contentType={currentContentType}
        />
      )}
    </div>
  );
};

export default ManualContentCreator;
