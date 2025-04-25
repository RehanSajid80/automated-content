
import React from "react";
import { AlertTriangle, SparklesIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ContentSuggestionsHeaderProps {
  apiError: string | null;
  usedModel: string | null;
  selectedModel: string;
}

export const ContentSuggestionsHeader: React.FC<ContentSuggestionsHeaderProps> = ({
  apiError,
  usedModel,
  selectedModel,
}) => {
  if (!apiError && !usedModel) return null;
  
  return (
    <>
      {apiError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>OpenAI Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      
      {usedModel && usedModel !== selectedModel && (
        <Alert variant="destructive" className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800">
          <SparklesIcon className="h-4 w-4" />
          <AlertTitle>Model Fallback Activated</AlertTitle>
          <AlertDescription>
            Due to rate limits, we used an alternative model.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
