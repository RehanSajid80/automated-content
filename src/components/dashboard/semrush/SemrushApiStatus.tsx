
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

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
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          SEMrush API key is configured. If you're seeing errors, check that:
          <br />• The domain format is valid (e.g., "example.com")
          <br />• The keyword exists in SEMrush database
          <br />• The domain has organic search visibility
        </AlertDescription>
      </Alert>
    );
  } else if (apiStatus === 'configured_but_no_data') {
    return (
      <Alert variant="default" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          SEMrush API key works but no data found. Try:
          <br />• Different or broader keywords
          <br />• Check if the domain has organic search presence
          <br />• Verify domain spelling and format
        </AlertDescription>
      </Alert>
    );
  } else if (apiStatus === 'missing') {
    return (
      <Alert variant="destructive" className="mt-2">
        <XCircle className="h-4 w-4" />
        <AlertDescription>SEMrush API key is not configured in Supabase secrets</AlertDescription>
      </Alert>
    );
  } else if (apiStatus === 'error') {
    return (
      <Alert variant="destructive" className="mt-2">
        <XCircle className="h-4 w-4" />
        <AlertDescription>SEMrush API error occurred. Check the error message above for details.</AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default SemrushApiStatus;
