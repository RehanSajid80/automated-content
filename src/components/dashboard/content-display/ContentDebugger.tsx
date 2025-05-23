
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Copy, Code } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContentDebuggerProps {
  generatedContent: any[];
  forceRender: () => void;
  rawResponse?: any;
}

export const ContentDebugger: React.FC<ContentDebuggerProps> = ({ 
  generatedContent,
  forceRender,
  rawResponse
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

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
      if (!generatedContent || generatedContent.length === 0) {
        return (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
            <p className="text-sm text-amber-700 dark:text-amber-400">No content available to display</p>
          </div>
        );
      }
      
      const contentItem = generatedContent[0];
      let displayText = "";
      
      if (contentItem.pillarContent) {
        const pillar = Array.isArray(contentItem.pillarContent) 
          ? contentItem.pillarContent[0] 
          : contentItem.pillarContent;
        displayText = pillar;
      } else if (contentItem.output) {
        displayText = contentItem.output;
      } else if (contentItem.content) {
        displayText = contentItem.content;
      } else {
        displayText = JSON.stringify(contentItem);
      }
      
      return (
        <div className="p-4 mb-4 bg-slate-50 dark:bg-slate-900 border rounded overflow-auto">
          <h4 className="text-sm font-medium mb-2">Content Preview:</h4>
          <p className="text-xs font-mono whitespace-pre-line">
            {displayText.substring(0, 300)}...
          </p>
        </div>
      );
    } catch (e) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-700 dark:text-red-400">Error displaying content: {String(e)}</p>
        </div>
      );
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-4">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="mb-2 flex items-center gap-2">
            <Code className="h-4 w-4" />
            {isOpen ? "Hide Debug Tools" : "Show Debug Tools"}
          </Button>
        </CollapsibleTrigger>
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-2 flex items-center gap-2"
          onClick={forceRender}
        >
          <RefreshCw className="h-4 w-4" />
          Force Refresh
        </Button>
      </div>
      
      <CollapsibleContent className="space-y-4">
        {displayContent()}
        
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
                      forceRender();
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
      </CollapsibleContent>
    </Collapsible>
  );
};
