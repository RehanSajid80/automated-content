
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface StandardContentViewProps {
  content: any;
}

export const StandardContentView: React.FC<StandardContentViewProps> = ({ content }) => {
  const hasOutput = content.output !== undefined;
  const hasTitle = content.title !== undefined && content.title !== "";

  if (hasOutput) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {hasTitle ? content.title : "Generated Content"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <pre className="whitespace-pre-wrap text-sm">{content.output}</pre>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Raw Content</CardTitle>
          <Badge variant="outline" className="ml-2 text-xs">Debug View</Badge>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4 flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Raw response displayed. Format not recognized as standard content.
            </p>
          </div>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <pre className="text-xs whitespace-pre-wrap">
              {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }
};
