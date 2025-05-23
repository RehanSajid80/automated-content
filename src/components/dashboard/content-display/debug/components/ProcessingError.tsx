
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProcessingErrorProps {
  error: string | null;
  details?: string;
}

export const ProcessingError: React.FC<ProcessingErrorProps> = ({ error, details }) => {
  if (!error) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Processing Error</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <p>TESTING: {error}</p>
          {details && (
            <div className="text-xs mt-2 p-2 bg-destructive/10 rounded-sm max-h-96 overflow-auto">
              <code className="whitespace-pre-wrap">{details}</code>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
