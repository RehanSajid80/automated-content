
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentActions } from "./ContentActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentSectionProps {
  content: string;
  section: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  content,
  section,
}) => {
  console.log(`Rendering ContentSection for ${section} with content length:`, content?.length || 0);
  
  const handleSaveContent = async () => {
    console.log(`Saving content for section ${section}`);
    try {
      const { error } = await supabase
        .from('content_library')
        .insert([
          {
            content_type: section,
            content: content,
            title: `Generated ${section} content`,
            topic_area: 'asset-management',
            is_saved: true
          }
        ])
        .select();

      if (error) {
        console.error("Error saving content:", error);
        throw error;
      }

      toast.success("Content saved successfully!", {
        description: `Your ${section} content has been saved to the library`
      });
      
      window.dispatchEvent(new CustomEvent('content-updated'));
    } catch (err) {
      console.error("Failed to save content:", err);
      toast.error("Failed to save content", {
        description: "An error occurred while saving the content"
      });
    }
  };

  if (!content || content.trim().length === 0) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <div className="text-amber-700 dark:text-amber-400">
          <p>No content available for this section.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4 mt-4">
      <div className="prose dark:prose-invert max-w-none">
        <div className="whitespace-pre-line">{content}</div>
      </div>
      <ContentActions 
        content={content}
        section={section}
        onSave={handleSaveContent}
      />
    </ScrollArea>
  );
};
