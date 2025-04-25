
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Tag, Share2 } from "lucide-react";
import { AISuggestion, AISuggestionsListProps } from "./types/aiSuggestions";

const contentTypeIcons = {
  pillar: <FileText className="h-4 w-4" />,
  support: <Building2 className="h-4 w-4" />,
  meta: <Tag className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />
};

const contentTypeLabels = {
  pillar: "Pillar Content",
  support: "Support Content",
  meta: "Meta Content",
  social: "Social Content"
};

export const AISuggestionsList: React.FC<AISuggestionsListProps> = ({
  suggestions,
  onSelect,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, idx) => (
          <Card key={idx} className="p-4 animate-pulse">
            <div className="h-24 bg-muted rounded-md"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <Card key={suggestion.id} className="p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-medium">{suggestion.title}</h3>
              <Badge variant="outline" className="flex items-center gap-1">
                {contentTypeIcons[suggestion.contentType]}
                {contentTypeLabels[suggestion.contentType]}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {suggestion.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {suggestion.keywords.slice(0, 3).map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ))}
              {suggestion.keywords.length > 3 && (
                <Badge variant="secondary">
                  +{suggestion.keywords.length - 3} more
                </Badge>
              )}
            </div>
            
            <Button 
              onClick={() => onSelect(suggestion)} 
              variant="outline" 
              className="w-full mt-2"
            >
              Select This Suggestion
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
