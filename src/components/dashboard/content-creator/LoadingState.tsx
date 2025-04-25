
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  progress?: number; // Optional progress value between 0-100
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...", 
  submessage,
  progress 
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
          {progress !== undefined && (
            <div className="w-full max-w-xs mt-2">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-in-out"
                  style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
