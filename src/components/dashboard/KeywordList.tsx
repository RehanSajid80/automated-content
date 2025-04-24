
import React, { useState } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordListProps {
  keywords: KeywordData[];
  selectedKeywords: string[];
  onKeywordToggle: (keyword: string) => void;
}

type SortField = 'volume' | 'difficulty' | 'trend' | null;
type SortDirection = 'asc' | 'desc';

const KeywordList: React.FC<KeywordListProps> = ({ keywords, selectedKeywords, onKeywordToggle }) => {
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
          <div className="col-span-1">
            <input 
              type="checkbox"
              checked={selectedKeywords.includes(kw.keyword)}
              onChange={(e) => {
                e.stopPropagation();
                onKeywordToggle(kw.keyword);
              }}
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
  );
};

export default KeywordList;
