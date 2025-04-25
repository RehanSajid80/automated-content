
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  submessage 
}) => {
  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">{message}</p>
          {submessage && (
            <p className="text-sm text-muted-foreground">{submessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
