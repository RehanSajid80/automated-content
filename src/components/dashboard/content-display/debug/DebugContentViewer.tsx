
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
  // Handle direct processing for display
  const contentToDisplay = processedContent?.length > 0 ? processedContent : 
    rawResponse ? (Array.isArray(rawResponse) ? rawResponse : [rawResponse]) : [];

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
