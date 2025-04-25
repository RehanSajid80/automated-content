
import React from "react";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIContentGeneratorProps, AISuggestion } from "./types/aiSuggestions";
import { AISuggestionsList } from "./AISuggestionsList";

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  keywords,
  topicArea,
  onSuggestionSelect,
  isLoading
}) => {
  const getMockSuggestions = (): AISuggestion[] => {
    return Array.from({ length: 5 }).map((_, index) => ({
      id: `suggestion-${index + 1}`,
      title: `${topicArea} Content Idea ${index + 1}`,
      description: `AI-generated content idea based on your keywords and topic area: ${topicArea}`,
      contentType: ['pillar', 'support', 'meta', 'social'][Math.floor(Math.random() * 4)] as any,
      keywords: keywords.slice(0, 5).map(k => k.keyword),
    }));
  };

  return (
    <div className="mt-6">
      <h3 className="text-base font-medium mb-3">AI Content Suggestions</h3>
      <AISuggestionsList 
        suggestions={getMockSuggestions()}
        onSelect={onSuggestionSelect}
        isLoading={isLoading}
      />
    </div>
  );
};

