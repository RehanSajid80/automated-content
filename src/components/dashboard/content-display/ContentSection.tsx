
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
  const handleSaveContent = async () => {
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

    if (error) throw error;

    toast.success("Content saved successfully!", {
      description: `Your ${section} content has been saved to the library`
    });
    
    window.dispatchEvent(new CustomEvent('content-updated'));
  };

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
