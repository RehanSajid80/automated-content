
import React from "react";
import { Button } from "@/components/ui/button";
import { Code, RefreshCw } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentPreview } from "./debug/ContentPreview";
import { ContentAnalysis } from "./debug/ContentAnalysis";

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
  const [isOpen, setIsOpen] = React.useState(true); // Default to open
  const [activeTab, setActiveTab] = React.useState("preview");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="mb-2 flex items-center gap-2">
              <Code className="h-4 w-4" />
              {isOpen ? "Hide Content Preview" : "Show Content Preview"}
            </Button>
          </CollapsibleTrigger>
          {isOpen && (
            <p className="text-xs text-muted-foreground ml-2 mb-2">
              {generatedContent?.length ? `${generatedContent.length} content items available` : "No content available"}
            </p>
          )}
        </div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="preview" className="flex-1">Visual Preview</TabsTrigger>
            <TabsTrigger value="raw" className="flex-1">Raw Content</TabsTrigger>
            {rawResponse && <TabsTrigger value="debug" className="flex-1">Debug View</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="preview" className="pt-4">
            <ContentPreview generatedContent={generatedContent} />
          </TabsContent>
          
          <TabsContent value="raw" className="pt-4">
            <ContentAnalysis 
              generatedContent={generatedContent}
              onForceRender={forceRender} 
            />
          </TabsContent>

          {rawResponse && (
            <TabsContent value="debug" className="pt-4">
              <div className="border rounded-md p-4 mt-2 bg-muted/50 overflow-auto max-h-[400px]">
                <pre className="text-xs whitespace-pre-wrap">
                  {typeof rawResponse === 'string' 
                    ? rawResponse 
                    : JSON.stringify(rawResponse, null, 2)
                  }
                </pre>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
};
