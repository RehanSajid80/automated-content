
import React from "react";
import { AIContentGeneratorProps } from "./types/aiSuggestions";
import { AISuggestionsList } from "./AISuggestionsList";
import AIContentDisplay from "./AIContentDisplay";
import { useN8nAgent } from "@/hooks/useN8nAgent";

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  keywords,
  topicArea,
  onSuggestionSelect,
  isLoading
}) => {
  const { suggestions, generatedContent } = useN8nAgent();

  return (
    <div className="mt-6">
      <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
      <AISuggestionsList 
        suggestions={suggestions}
        onSelect={onSuggestionSelect}
        isLoading={isLoading}
      />
      
      {generatedContent.length > 0 && (
        <AIContentDisplay content={generatedContent} />
      )}
    </div>
  );
};
