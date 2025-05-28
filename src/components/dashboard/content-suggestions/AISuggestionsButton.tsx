
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AISuggestionsButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const AISuggestionsButton: React.FC<AISuggestionsButtonProps> = ({
  onClick,
  isLoading,
  disabled
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating AI Suggestions...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get AI Content Suggestions
        </>
      )}
    </Button>
  );
};
