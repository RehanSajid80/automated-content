
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProcessingErrorProps {
  error: string | null;
}

export const ProcessingError: React.FC<ProcessingErrorProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Processing Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

