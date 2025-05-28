
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SemrushErrorDisplayProps {
  errorMsg: string | null;
}

const SemrushErrorDisplay: React.FC<SemrushErrorDisplayProps> = ({ errorMsg }) => {
  if (!errorMsg) return null;

  return (
    <Alert variant="destructive" className="mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{errorMsg}</AlertDescription>
    </Alert>
  );
};

export default SemrushErrorDisplay;
