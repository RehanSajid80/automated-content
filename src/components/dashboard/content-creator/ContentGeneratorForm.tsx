
import React from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "./LoadingState";

interface ContentGeneratorFormProps {
  activeTab: string;
  keywords: string;
  onKeywordsChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generatingProgress: string;
}

export const ContentGeneratorForm: React.FC<ContentGeneratorFormProps> = ({
  activeTab,
  keywords,
  onKeywordsChange,
  onGenerate,
  isGenerating,
  generatingProgress,
}) => {
  if (isGenerating) {
    return <LoadingState message={generatingProgress} />;
  }

  return (
    <div className="space-y-4">
      <textarea
        value={keywords}
        onChange={(e) => onKeywordsChange(e.target.value)}
        placeholder="Enter keywords separated by commas..."
        className="w-full h-32 p-3 border rounded-md"
      />
      <Button 
        onClick={onGenerate}
        disabled={!keywords.trim()}
        className="w-full"
      >
        Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content
      </Button>
    </div>
  );
};
