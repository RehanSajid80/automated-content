
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
  
  // Format content for display, handling circular references
  let formattedContent = "";
  try {
    // Try to stringify the response, with a custom replacer to handle circular references
    formattedContent = typeof rawResponse === 'string' 
      ? rawResponse 
      : JSON.stringify(rawResponse, (key, value) => {
          if (key && typeof value === 'object' && value !== null) {
            // Check for circular references
            try {
              JSON.stringify(value);
            } catch (err) {
              return `[Circular Reference to ${key}]`;
            }
          }
          return value;
        }, 2);
  } catch (err) {
    // If JSON.stringify fails, provide a readable error
    formattedContent = `Unable to display raw response due to: ${err.message}`;
    console.error("Error formatting raw response:", err);
  }
  
  // Check if the content appears to be AI content but with circular references
  const containsCircularReferences = formattedContent.includes('[Circular Reference');
  
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
        
        {containsCircularReferences && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800 rounded-md">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              This response contains circular references which can't be fully displayed. 
              The content is still usable but may not appear correctly in this raw view.
            </p>
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
