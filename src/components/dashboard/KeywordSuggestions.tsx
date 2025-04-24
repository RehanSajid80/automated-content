
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContentSuggestion, ContentType } from "@/utils/contentSuggestionUtils";
import { AlertTriangle, FileText, Layout, MessageSquare, BookOpen, TrendingUp } from "lucide-react";

interface KeywordSuggestionsProps {
  suggestions: ContentSuggestion[];
}

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  pillar: <FileText className="h-4 w-4" />,
  blog: <MessageSquare className="h-4 w-4" />,
  guide: <BookOpen className="h-4 w-4" />,
  landing: <Layout className="h-4 w-4" />,
  social: <TrendingUp className="h-4 w-4" />
};

const contentTypeLabels: Record<ContentType, string> = {
  pillar: "Pillar Content",
  blog: "Blog Post",
  guide: "Guide",
  landing: "Landing Page",
  social: "Social Content"
};

const priorityColors = {
  high: "text-red-500 border-red-200 bg-red-50",
  medium: "text-orange-500 border-orange-200 bg-orange-50",
  low: "text-green-500 border-green-200 bg-green-50"
};

const KeywordSuggestions: React.FC<KeywordSuggestionsProps> = ({ suggestions }) => {
  if (!suggestions.length) {
    return (
      <div className="text-center text-muted-foreground p-4">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <p>No content suggestions available. Try selecting different keywords.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <Card key={index} className="p-4">
          <div className="flex flex-col space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-medium">{suggestion.keyword}</h3>
              <Badge 
                variant="outline" 
                className={priorityColors[suggestion.priority]}
              >
                {suggestion.priority} priority
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {suggestion.contentTypes.map((type) => (
                <Badge 
                  key={type}
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {contentTypeIcons[type]}
                  {contentTypeLabels[type]}
                </Badge>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground">
              {suggestion.reason}
            </p>
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default KeywordSuggestions;
