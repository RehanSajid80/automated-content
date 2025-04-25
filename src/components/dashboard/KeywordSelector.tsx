
import React from "react";
import { Button } from "@/components/ui/button";
import { KeywordData } from "@/utils/excelUtils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TrendingUp as TrendingUpIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KeywordSelectorProps {
  keywords: KeywordData[];
  selectedKeywords: string[];
  onKeywordToggle: (keyword: string) => void;
  onAutoSelect: () => void;
}

export const KeywordSelector: React.FC<KeywordSelectorProps> = ({
  keywords,
  selectedKeywords,
  onKeywordToggle,
  onAutoSelect,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">
          Select Keywords for Analysis
        </label>
        {keywords.length > 0 && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAutoSelect}
              className="text-xs flex items-center gap-1"
            >
              <TrendingUpIcon className="h-3 w-3" />
              Auto-select Trending
            </Button>
            <div className="text-xs text-muted-foreground">
              {selectedKeywords.length} of {keywords.length} selected
            </div>
          </div>
        )}
      </div>
      
      {keywords.length === 0 ? (
        <div className="bg-secondary/30 p-3 rounded-md text-muted-foreground text-sm">
          No keywords available. Please search for keywords using the domain search above or add keywords from the Keyword Research tab.
        </div>
      ) : (
        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
          {keywords.map((kw, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <Checkbox 
                id={`kw-${idx}`} 
                checked={selectedKeywords.includes(kw.keyword)}
                onCheckedChange={() => onKeywordToggle(kw.keyword)}
              />
              <label 
                htmlFor={`kw-${idx}`}
                className="text-sm cursor-pointer flex items-center"
              >
                {kw.keyword}
                {kw.trend === "up" && (
                  <Badge variant="outline" className="ml-2 text-xs flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                    <TrendingUpIcon className="h-3 w-3" />
                    Trending
                  </Badge>
                )}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
