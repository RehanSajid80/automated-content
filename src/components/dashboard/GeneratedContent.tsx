
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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
          <Button size="sm" className="h-8 text-xs px-2">
            Save <Check size={14} className="ml-1" />
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
