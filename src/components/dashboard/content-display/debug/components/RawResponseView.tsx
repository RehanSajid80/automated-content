
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RawResponseViewProps {
  rawResponse: any;
}

export const RawResponseView: React.FC<RawResponseViewProps> = ({ rawResponse }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Raw Response Data</CardTitle>
        <Badge variant="outline">Debug View</Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <pre className="text-xs whitespace-pre-wrap">
            {typeof rawResponse === 'string' 
              ? rawResponse 
              : JSON.stringify(rawResponse, null, 2)
            }
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
