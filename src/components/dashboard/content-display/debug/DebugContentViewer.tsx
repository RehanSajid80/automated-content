
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormattedContent } from "./components/FormattedContent";
import { RawResponseView } from "./components/RawResponseView";
import { EmptyContentState } from "./components/EmptyContentState";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DebugContentViewerProps {
  rawResponse: any;
  processedContent: any[];
}

export const DebugContentViewer: React.FC<DebugContentViewerProps> = ({ 
  rawResponse, 
  processedContent 
}) => {
  const [reprocessedContent, setReprocessedContent] = React.useState<any[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Process raw response if it contains JSON as a string within code blocks
  const preprocessRawResponse = (rawResponse: any) => {
    console.log("Preprocessing raw response:", typeof rawResponse);
    
    try {
      if (typeof rawResponse === 'string') {
        // Try to extract JSON from code blocks
        const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                          rawResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[1]);
          } catch (err) {
            console.error("Failed to parse JSON from code block in raw response");
          }
        }
        
        // Try parsing as direct JSON
        if (rawResponse.trim().startsWith('{') || rawResponse.trim().startsWith('[')) {
          try {
            return JSON.parse(rawResponse);
          } catch (err) {
            console.error("Failed to parse raw response as direct JSON");
          }
        }
      } else if (Array.isArray(rawResponse) && rawResponse.length > 0) {
        // Check if the array contains objects with an output property that might contain code blocks
        const firstItem = rawResponse[0];
        if (firstItem && firstItem.output && typeof firstItem.output === 'string') {
          console.log("Found output property in array item:", firstItem.output.substring(0, 100));
          // Try to extract JSON from code blocks in the output
          const jsonMatch = firstItem.output.match(/```json\s*([\s\S]*?)\s*```/) || 
                            firstItem.output.match(/```\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            try {
              return JSON.parse(jsonMatch[1]);
            } catch (err) {
              console.error("Failed to parse JSON from code block in output");
            }
          }
        }
      } else if (rawResponse?.output && typeof rawResponse.output === 'string') {
        // Handle object with output property that might contain JSON
        console.log("Found output property in object:", rawResponse.output.substring(0, 100));
        return preprocessRawResponse(rawResponse.output);
      }
      
      return rawResponse;
    } catch (error) {
      console.error("Error preprocessing raw response:", error);
      return rawResponse;
    }
  };
  
  // Manually process the raw response
  const processRawResponse = () => {
    setIsProcessing(true);
    try {
      const processedRawResponse = preprocessRawResponse(rawResponse);
      console.log("Processed raw response for display:", processedRawResponse);
      
      // Handle direct processing for display
      const contentToDisplay = processedRawResponse ? (
        Array.isArray(processedRawResponse) ? processedRawResponse : 
        // If not an array but has AI content structure, wrap in array
        (processedRawResponse && (
          processedRawResponse.pillarContent !== undefined ||
          processedRawResponse.supportContent !== undefined ||
          processedRawResponse.socialMediaPosts !== undefined ||
          processedRawResponse.emailSeries !== undefined
        )) ? [processedRawResponse] :
        // Last resort - wrap rawResponse in array
        [{ output: typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse) }]
      ) : [];
      
      console.log("Content to display:", contentToDisplay);
      setReprocessedContent(contentToDisplay);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process raw response once on component mount
  React.useEffect(() => {
    if (rawResponse && (!processedContent || processedContent.length === 0)) {
      processRawResponse();
    }
  }, [rawResponse, processedContent]);
  
  // Content to display - either the processed content or reprocessed content
  const contentToDisplay = processedContent?.length > 0 ? processedContent : 
                          reprocessedContent?.length > 0 ? reprocessedContent : [];
  
  // Log what we're displaying
  console.log("Content to display:", contentToDisplay);

  if (!rawResponse && (!processedContent || processedContent.length === 0)) {
    return <EmptyContentState />;
  }

  return (
    <Tabs defaultValue="formatted" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="formatted">Formatted Content</TabsTrigger>
        <TabsTrigger value="raw">Raw JSON</TabsTrigger>
      </TabsList>
      
      <TabsContent value="formatted" className="space-y-4">
        {((!processedContent || processedContent.length === 0) && rawResponse) && (
          <div className="mb-4 p-4 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <div className="flex justify-between items-center">
              <p className="text-amber-800 dark:text-amber-400 text-sm font-medium">
                No processed content available. Try processing the raw response.
              </p>
              
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={processRawResponse}
                className="flex items-center gap-2"
              >
                {isProcessing ? "Processing..." : "Process Raw Response"}
                {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
              </Button>
            </div>
          </div>
        )}
        <FormattedContent processedContent={contentToDisplay} />
      </TabsContent>
      
      <TabsContent value="raw">
        <RawResponseView rawResponse={rawResponse} />
      </TabsContent>
    </Tabs>
  );
};
