
import React from "react";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedContentProps {
  content: string;
  onContentChange: (content: string) => void;
  activeTab: string;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({
  content,
  onContentChange,
  activeTab
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast("Content copied to clipboard", {
      description: "You can now paste it wherever you need it."
    });
  };

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content: content,
            content_type: activeTab,
            is_saved: true,
            title: `Generated ${activeTab} content`,
            topic_area: 'workspace-management',
            keywords: [] // Empty array for now, can be updated later
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Dispatch event to refresh content lists and stats
      window.dispatchEvent(new Event('content-updated'));

      toast.success("Content saved successfully!", {
        description: `Your ${activeTab} content has been saved to the library`
      });

    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Failed to save content", {
        description: "Please try again or contact support if the issue persists"
      });
    }
  };

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
          <Button size="sm" variant="ghost" className="h-8 text-xs px-2">
            Regenerate
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 text-xs px-2"
            onClick={handleCopy}
          >
            Copy
          </Button>
          <Button 
            size="sm" 
            className="h-8 text-xs px-2"
            onClick={handleSave}
          >
            Save <Save size={14} className="ml-1" />
          </Button>
        </div>
      </div>
      <Textarea 
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="resize-none h-60 font-mono text-sm"
      />
    </div>
  );
};

export default GeneratedContent;
