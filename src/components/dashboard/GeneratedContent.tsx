
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getTypeLabel } from "./utils/content-type-utils";
import { Input } from "@/components/ui/input";

interface GeneratedContentProps {
  content: string;
  onContentChange: (content: string) => void;
  activeTab: string;
  title?: string;
  onTitleChange?: (title: string) => void;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({
  content,
  onContentChange,
  activeTab,
  title,
  onTitleChange
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast("Content copied to clipboard", {
      description: "You can now paste it wherever you need it."
    });
  };

  const handleSave = async () => {
    try {
      if (!content || content.trim().length === 0) {
        toast.error("No content to save", {
          description: "Please generate content first"
        });
        return;
      }
      
      // Determine appropriate title based on content type if not provided
      let contentTitle = title || '';
      
      if (!contentTitle) {
        switch (activeTab) {
          case 'social':
            contentTitle = 'Social Media Posts';
            break;
          case 'pillar':
            contentTitle = 'Pillar Content Article';
            break;
          case 'support':
            contentTitle = 'Support Page Content';
            break;
          case 'meta':
            contentTitle = 'SEO Meta Tags';
            break;
          default:
            contentTitle = `Generated ${activeTab} content`;
        }
      }
      
      console.log(`Saving content with type: ${activeTab} and title: ${contentTitle}`);
      
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content: content,
            content_type: activeTab, // Make sure we use the activeTab as the content_type
            is_saved: true,
            title: contentTitle,
            topic_area: 'workspace-management',
            keywords: [] // Empty array for now, can be updated later
          }
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('Content saved successfully, dispatching content-updated event');
      
      // Dispatch event to refresh content lists and stats
      window.dispatchEvent(new CustomEvent('content-updated'));

      toast.success("Content saved successfully!", {
        description: activeTab === 'social' 
          ? 'Your social media posts have been saved to the library' 
          : `Your ${activeTab} content has been saved to the library`
      });

    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Failed to save content", {
        description: "Please try again or contact support if the issue persists"
      });
    }
  };

  // Get proper display label for the content type
  const contentTypeLabel = getTypeLabel(activeTab);

  return (
    <div className="rounded-lg border border-border p-4 mt-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="text-sm font-medium">
          Generated Content 
          {activeTab === "pillar" && (
            <span className="text-xs text-muted-foreground ml-2">
              ({content.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()} words)
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            className="h-8 text-xs px-2"
            onClick={handleSave}
          >
            Save {contentTypeLabel}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs px-2"
            onClick={handleCopy}
          >
            Copy
          </Button>
        </div>
      </div>
      
      {onTitleChange && (
        <div className="mb-4">
          <Input
            value={title || ''}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full"
            placeholder="Enter content title"
          />
          <div className="text-xs text-muted-foreground mt-1">
            A title will help you identify this content in your library
          </div>
        </div>
      )}
      
      <Textarea 
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="resize-none h-60 font-mono text-sm"
      />
    </div>
  );
};

export default GeneratedContent;
