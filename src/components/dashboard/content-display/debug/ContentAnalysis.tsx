
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ContentAnalysisProps {
  generatedContent: any[];
  onForceRender: () => void;
}

export const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ 
  generatedContent,
  onForceRender
}) => {
  const handleCopyRawContent = () => {
    try {
      const contentString = JSON.stringify(generatedContent, null, 2);
      navigator.clipboard.writeText(contentString);
      toast.success("Raw content copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy raw content");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2">Content Structure Analysis</h3>
        <p className="text-xs mb-4">This shows the structure of the generated content for debugging purposes.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold mb-1">Content Keys</h4>
            {generatedContent && generatedContent.length > 0 ? (
              <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                {Object.keys(generatedContent[0]).map(key => (
                  <div key={key} className="flex items-center justify-between mb-1">
                    <span className="font-mono text-blue-600 dark:text-blue-400">{key}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {typeof generatedContent[0][key] === 'object' 
                        ? (Array.isArray(generatedContent[0][key]) 
                          ? `Array(${generatedContent[0][key].length})` 
                          : 'Object') 
                        : typeof generatedContent[0][key]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No content available</p>
            )}
          </div>
          
          <div>
            <h4 className="text-xs font-semibold mb-1">Actions</h4>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs w-full justify-start" 
                onClick={handleCopyRawContent}
              >
                <Copy className="h-3 w-3 mr-2" />
                Copy Raw Content
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs w-full justify-start"
                onClick={() => {
                  onForceRender();
                  toast.success("Display refreshed");
                }}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Force Refresh Display
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
