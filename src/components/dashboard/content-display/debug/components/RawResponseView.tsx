
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle } from "lucide-react";

interface RawResponseViewProps {
  rawResponse: any;
}

export const RawResponseView: React.FC<RawResponseViewProps> = ({ rawResponse }) => {
  // Determine if response contains an error
  const hasError = rawResponse && (
    (typeof rawResponse === 'object' && (rawResponse.error || rawResponse.message === 'Error in workflow')) ||
    (typeof rawResponse === 'string' && (
      rawResponse.includes('error') || 
      rawResponse.includes('Error in workflow')
    ))
  );
  
  // Format content for display
  const formattedContent = typeof rawResponse === 'string' 
    ? rawResponse 
    : JSON.stringify(rawResponse, null, 2);
  
  return (
    <Card className={hasError ? "border-red-300" : ""}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Raw Response Data</CardTitle>
          <Badge variant="outline">Debug View</Badge>
        </div>
        
        {hasError ? (
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Error Detected</span>
          </div>
        ) : rawResponse ? (
          <div className="flex items-center text-green-500">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">Response Received</span>
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {!rawResponse && (
          <div className="text-center p-4 text-muted-foreground">
            No response data available
          </div>
        )}
        
        {rawResponse && (
          <ScrollArea className="h-[400px] rounded-md border p-4 bg-muted/20">
            <pre className={`text-xs whitespace-pre-wrap ${hasError ? "text-red-600" : ""}`}>
              {formattedContent}
            </pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
