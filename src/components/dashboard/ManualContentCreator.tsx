
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ContentForm, ContentFormData } from "./content-creator/ContentForm";
import { GeneratedContentCard } from "./content-creator/GeneratedContentCard";
import { contentTypes } from "@/data/contentTypes";
import { authorPersonas } from "@/data/authorPersonas";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ManualContentCreatorProps {
  className?: string;
}

const ManualContentCreator: React.FC<ManualContentCreatorProps> = ({ className }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [currentContentType, setCurrentContentType] = useState("pillar");
  
  const handleFormSubmit = (data: ContentFormData) => {
    setIsGenerating(true);
    setGeneratedContent("");
    setCurrentContentType(data.contentType);
    
    // Simulate AI generation with delay
    setTimeout(() => {
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
      setIsGenerating(false);
    }, 2000);
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

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500", className)}>
      <h3 className="text-lg font-semibold mb-6">Manual Content Creator</h3>
      
      <ContentForm 
        onSubmit={handleFormSubmit}
        isGenerating={isGenerating}
      />
      
      {generatedContent && (
        <GeneratedContentCard
          content={generatedContent}
          onContentChange={setGeneratedContent}
          onRegenerateContent={() => handleFormSubmit}
          onSaveContent={handleSaveContent}
          contentType={currentContentType}
        />
      )}
    </div>
  );
};

export default ManualContentCreator;
