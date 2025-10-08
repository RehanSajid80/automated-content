
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Building2, Tag, Share2, Save } from "lucide-react";
import { AISuggestion, AISuggestionsListProps } from "./types/aiSuggestions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const saveSuggestionToLibrary = async (suggestion: AISuggestion) => {
    try {
      const formattedContent = `
# ${suggestion.title}

${suggestion.description}

## Keywords
${suggestion.keywords.join(', ')}
      `.trim();

      const { error } = await supabase
        .from('content_library')
        .insert({
          title: suggestion.title,
          content: formattedContent,
          content_type: suggestion.contentType,
          keywords: suggestion.keywords,
          is_saved: true
        });

      if (error) throw error;

      toast.success("Saved!", {
        description: "AI suggestion saved to your library",
      });
    } catch (error) {
      console.error("Error saving suggestion:", error);
      toast.error("Failed to save suggestion");
    }
  };

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
            
            <div className="flex gap-2 mt-2">
              <Button 
                onClick={() => saveSuggestionToLibrary(suggestion)} 
                variant="outline" 
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button 
                onClick={() => onSelect(suggestion)} 
                variant="default" 
                className="flex-1"
              >
                Select
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
