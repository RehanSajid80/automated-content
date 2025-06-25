
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Target, FileText, Share2, X } from "lucide-react";

interface ContentStrategyRecommendation {
  priorityKeywords: string[];
  contentTypes: {
    pillarContent: string[];
    supportPages: string[];
    metaContent: string[];
    socialMedia: string[];
  };
  reasoning: string;
  officeSpaceRelevance: string;
}

interface AIContentStrategyPanelProps {
  recommendations: ContentStrategyRecommendation;
  onClose: () => void;
  onKeywordSelect?: (keywords: string[]) => void;
}

export const AIContentStrategyPanel: React.FC<AIContentStrategyPanelProps> = ({
  recommendations,
  onClose,
  onKeywordSelect
}) => {
  const handleSelectPriorityKeywords = () => {
    if (onKeywordSelect) {
      onKeywordSelect(recommendations.priorityKeywords);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <CardTitle>AI Content Strategy Recommendations</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Strategic recommendations for office space software content
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Priority Keywords */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Priority Keywords ({recommendations.priorityKeywords.length})
            </h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectPriorityKeywords}
            >
              Select These Keywords
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.priorityKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Pillar Content
            </h5>
            <ul className="text-sm space-y-1">
              {recommendations.contentTypes.pillarContent.map((item, index) => (
                <li key={index} className="text-muted-foreground">• {item}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              Support Pages
            </h5>
            <ul className="text-sm space-y-1">
              {recommendations.contentTypes.supportPages.map((item, index) => (
                <li key={index} className="text-muted-foreground">• {item}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-500" />
              Meta Content
            </h5>
            <ul className="text-sm space-y-1">
              {recommendations.contentTypes.metaContent.map((item, index) => (
                <li key={index} className="text-muted-foreground">• {item}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4 text-pink-500" />
              Social Media
            </h5>
            <ul className="text-sm space-y-1">
              {recommendations.contentTypes.socialMedia.map((item, index) => (
                <li key={index} className="text-muted-foreground">• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Strategic Reasoning */}
        <div className="space-y-2">
          <h4 className="font-medium">Strategic Reasoning</h4>
          <p className="text-sm text-muted-foreground">{recommendations.reasoning}</p>
        </div>

        {/* Office Space Relevance */}
        <div className="space-y-2">
          <h4 className="font-medium">Office Space Relevance</h4>
          <p className="text-sm text-muted-foreground">{recommendations.officeSpaceRelevance}</p>
        </div>
      </CardContent>
    </Card>
  );
};
