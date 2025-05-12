
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContentDebuggerProps {
  generatedContent: any[];
  forceRender: () => void;
}

export const ContentDebugger: React.FC<ContentDebuggerProps> = ({ 
  generatedContent,
  forceRender
}) => {
  if (!generatedContent || generatedContent.length === 0) return null;

  const handleCopyRawContent = () => {
    try {
      const contentString = JSON.stringify(generatedContent, null, 2);
      navigator.clipboard.writeText(contentString);
      toast.success("Raw content copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy raw content");
    }
  };

  const displayContent = () => {
    try {
      const contentItem = generatedContent[0];
      const output = contentItem.output || contentItem.content || JSON.stringify(contentItem);
      return (
        <div className="p-4 mb-4 bg-slate-50 dark:bg-slate-900 border rounded overflow-auto">
          <h4 className="text-sm font-medium mb-2">Raw Content Preview:</h4>
          <p className="text-xs font-mono whitespace-pre-line">
            {output.substring(0, 300)}...
          </p>
        </div>
      );
    } catch (e) {
      return <p>Error displaying debug content: {String(e)}</p>;
    }
  };

  return (
    <>
      {displayContent()}
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs" 
          onClick={handleCopyRawContent}
        >
          Copy Raw Content
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ml-2 text-xs"
          onClick={forceRender}
        >
          Force Refresh
        </Button>
      </div>
    </>
  );
};
