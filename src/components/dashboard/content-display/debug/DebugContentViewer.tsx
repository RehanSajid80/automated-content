
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormattedContent } from "./components/FormattedContent";
import { RawResponseView } from "./components/RawResponseView";
import { EmptyContentState } from "./components/EmptyContentState";

interface DebugContentViewerProps {
  rawResponse: any;
  processedContent: any[];
}

export const DebugContentViewer: React.FC<DebugContentViewerProps> = ({ 
  rawResponse, 
  processedContent 
}) => {
  // Process raw response if it contains JSON as a string within code blocks
  const preprocessRawResponse = (rawResponse: any) => {
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
    } else if (rawResponse?.output && typeof rawResponse.output === 'string') {
      // Handle object with output property that might contain JSON
      return preprocessRawResponse(rawResponse.output);
    }
    
    return rawResponse;
  };
  
  // Process raw response
  const processedRawResponse = preprocessRawResponse(rawResponse);
  console.log("Processed raw response for display:", processedRawResponse);
  
  // Handle direct processing for display
  const contentToDisplay = processedContent?.length > 0 ? processedContent : 
    processedRawResponse ? (
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
        <FormattedContent processedContent={contentToDisplay} />
      </TabsContent>
      
      <TabsContent value="raw">
        <RawResponseView rawResponse={rawResponse} />
      </TabsContent>
    </Tabs>
  );
};
