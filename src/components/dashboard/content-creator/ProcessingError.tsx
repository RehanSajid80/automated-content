
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ProcessingErrorProps {
  error: string;
  onRetry: () => void;
}

export const ProcessingError: React.FC<ProcessingErrorProps> = ({ error, onRetry }) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Processing Content</AlertTitle>
      <AlertDescription>
        {error}
        <div className="mt-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onRetry}
          >
            Retry Processing
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
