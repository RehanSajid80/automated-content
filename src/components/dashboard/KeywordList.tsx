
import React, { useState } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { TrendingUp, ArrowUp, ArrowDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface KeywordListProps {
  keywords: KeywordData[];
  selectedKeywords: string[];
  onKeywordToggle: (keyword: string) => void;
  onGenerateContent?: (keywords: string[]) => void;
}

type SortField = 'volume' | 'difficulty' | 'trend' | null;
type SortDirection = 'asc' | 'desc';

const KeywordList: React.FC<KeywordListProps> = ({ 
  keywords, 
  selectedKeywords, 
  onKeywordToggle,
  onGenerateContent 
}) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    if (!sortField) return 0;
    
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'trend') {
      return multiplier * (a.trend === 'up' ? 1 : -1) - (b.trend === 'up' ? 1 : -1);
    }
    
    return multiplier * (Number(a[sortField]) - Number(b[sortField]));
  });

  const handleGenerateContent = () => {
    if (selectedKeywords.length > 0 && onGenerateContent) {
      onGenerateContent(selectedKeywords);
      toast.success(`Creating content for ${selectedKeywords.length} keywords`);
    } else if (selectedKeywords.length === 0) {
      toast.error("Please select at least one keyword");
    }
  };

  if (keywords.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No keywords match your filters
      </div>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp size={14} className="ml-1" /> : 
      <ArrowDown size={14} className="ml-1" />;
  };

  return (
    <div className="space-y-4">
      {selectedKeywords.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-secondary/20 rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedKeywords.length} keyword{selectedKeywords.length > 1 ? 's' : ''} selected
          </span>
          <Button
            onClick={handleGenerateContent}
            size="sm"
            className="gap-2"
            variant="create"
          >
            <FileText size={16} />
            Create Content
          </Button>
        </div>
      )}
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        <div className="bg-secondary/50 text-xs font-medium text-muted-foreground grid grid-cols-12 gap-4 px-4 py-3 sticky top-0">
          <div className="col-span-1"></div>
          <div className="col-span-5">Keyword</div>
          <div 
            className="col-span-2 text-right cursor-pointer flex items-center justify-end hover:text-foreground"
            onClick={() => handleSort('volume')}
          >
            Volume <SortIcon field="volume" />
          </div>
          <div 
            className="col-span-2 text-right cursor-pointer flex items-center justify-end hover:text-foreground"
            onClick={() => handleSort('difficulty')}
          >
            Difficulty <SortIcon field="difficulty" />
          </div>
          <div 
            className="col-span-2 text-right cursor-pointer flex items-center justify-end hover:text-foreground"
            onClick={() => handleSort('trend')}
          >
            Trend <SortIcon field="trend" />
          </div>
        </div>
        {sortedKeywords.map((kw) => (
          <div 
            key={kw.keyword}
            className={cn(
              "grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-secondary/30 transition-colors cursor-pointer",
              selectedKeywords.includes(kw.keyword) && "bg-secondary/50"
            )}
            onClick={() => onKeywordToggle(kw.keyword)}
          >
            <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
              <Checkbox 
                checked={selectedKeywords.includes(kw.keyword)}
                onCheckedChange={() => onKeywordToggle(kw.keyword)}
                className="rounded border-muted"
              />
            </div>
            <div className="col-span-5 font-medium flex items-center">
              {kw.keyword}
              {kw.trend === "up" && (
                <TrendingUp size={14} className="ml-2 text-green-500" />
              )}
            </div>
            <div className="col-span-2 text-right">{kw.volume.toLocaleString()}</div>
            <div className="col-span-2 text-right">
              <div className="inline-flex items-center">
                <div className="w-8 h-2 rounded-full bg-muted overflow-hidden mr-2">
                  <div 
                    className={cn(
                      "h-full",
                      kw.difficulty > 70 ? "bg-red-500" : 
                      kw.difficulty > 50 ? "bg-orange-500" : 
                      "bg-green-500"
                    )}
                    style={{ width: `${kw.difficulty}%` }}
                  ></div>
                </div>
                {kw.difficulty}
              </div>
            </div>
            <div className="col-span-2 text-right">{kw.cpc.toFixed(2)}</div>
          </div>
        ))}
      </div>
      {keywords.length > 0 && selectedKeywords.length === 0 && (
        <div className="flex justify-center mt-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => {
              toast.info("Please select at least one keyword");
            }}
          >
            <FileText size={16} className="mr-2" />
            Select keywords to generate content
          </Button>
        </div>
      )}
    </div>
  );
};

export default KeywordList;
