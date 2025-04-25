
import React from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

interface AISuggestionsButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const AISuggestionsButton: React.FC<AISuggestionsButtonProps> = ({
  onClick,
  isLoading,
  disabled,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full relative overflow-hidden"
      variant="default"
    >
      <BrainCircuit className={isLoading ? "invisible" : "mr-2"} size={16} />
      <span className={isLoading ? "invisible" : ""}>
        AI Suggestions
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </Button>
  );
};
