
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormattedContentTab } from "./components/FormattedContentTab";
import { RawResponseView } from "./components/RawResponseView";
import { EmptyContentState } from "./components/EmptyContentState";
import { useResponseProcessor } from "./hooks/useResponseProcessor";

interface DebugContentViewerProps {
  rawResponse: any;
  processedContent: any[];
}

export const DebugContentViewer: React.FC<DebugContentViewerProps> = ({ 
  rawResponse, 
  processedContent 
}) => {
  const {
    reprocessedContent,
    isProcessing,
    processingError,
    processRawResponse,
    contentToDisplay
  } = useResponseProcessor(rawResponse, processedContent);

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
        <FormattedContentTab
          processingError={processingError}
          processedContent={processedContent}
          reprocessedContent={reprocessedContent}
          rawResponse={rawResponse}
          isProcessing={isProcessing}
          onProcessRawResponse={processRawResponse}
          contentToDisplay={contentToDisplay}
        />
      </TabsContent>
      
      <TabsContent value="raw">
        <RawResponseView rawResponse={rawResponse} />
      </TabsContent>
    </Tabs>
  );
};
