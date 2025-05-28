
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface SemrushApiStatusProps {
  apiStatus: string | null;
}

const SemrushApiStatus: React.FC<SemrushApiStatusProps> = ({ apiStatus }) => {
  if (!apiStatus) return null;
  
  if (apiStatus === 'working') {
    return (
      <Alert className="mt-2">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>SEMrush API key is working correctly</AlertDescription>
      </Alert>
    );
  } else if (apiStatus === 'configured') {
    return (
      <Alert className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>SEMrush API key is configured but check keyword/domain validity</AlertDescription>
      </Alert>
    );
  } else if (apiStatus === 'missing') {
    return (
      <Alert variant="destructive" className="mt-2">
        <XCircle className="h-4 w-4" />
        <AlertDescription>SEMrush API key is not configured in Supabase secrets</AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default SemrushApiStatus;
