
import React, { useState } from "react";
import { Search, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Mock SEMrush keyword data
const mockKeywords = [
  { keyword: "content marketing strategy", volume: 4800, difficulty: 78, cpc: 12.5, trend: "up" },
  { keyword: "seo content writing", volume: 3200, difficulty: 65, cpc: 8.20, trend: "up" },
  { keyword: "ai content creation", volume: 6500, difficulty: 82, cpc: 15.75, trend: "up" },
  { keyword: "content optimization tools", volume: 2900, difficulty: 54, cpc: 6.80, trend: "neutral" },
  { keyword: "keyword research tools", volume: 5100, difficulty: 70, cpc: 10.25, trend: "up" },
  { keyword: "content creation agency", volume: 3800, difficulty: 60, cpc: 9.40, trend: "neutral" },
  { keyword: "blog content strategy", volume: 2400, difficulty: 45, cpc: 5.60, trend: "neutral" },
  { keyword: "pillar content examples", volume: 1900, difficulty: 40, cpc: 4.90, trend: "up" },
];

interface KeywordResearchProps {
  className?: string;
}

const KeywordResearch: React.FC<KeywordResearchProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const filteredKeywords = mockKeywords.filter(kw => 
    kw.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleKeywordSelection = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-300", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">SEMrush Keyword Research</h3>
        <Button variant="outline" size="sm" className="text-xs">
          Import from SEMrush <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
      
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for keywords..."
          className="pl-9 bg-secondary/50"
        />
      </div>
      
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="bg-secondary/50 text-xs font-medium text-muted-foreground grid grid-cols-12 gap-4 px-4 py-3">
          <div className="col-span-1"></div>
          <div className="col-span-5">Keyword</div>
          <div className="col-span-2 text-right">Volume</div>
          <div className="col-span-2 text-right">Difficulty</div>
          <div className="col-span-2 text-right">CPC ($)</div>
        </div>
        <div className="divide-y divide-border">
          {filteredKeywords.map((kw, index) => (
            <div 
              key={kw.keyword}
              className={cn(
                "grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-secondary/30 transition-colors",
                selectedKeywords.includes(kw.keyword) && "bg-secondary/50"
              )}
            >
              <div className="col-span-1">
                <input 
                  type="checkbox"
                  checked={selectedKeywords.includes(kw.keyword)}
                  onChange={() => toggleKeywordSelection(kw.keyword)}
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
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {selectedKeywords.length} keywords selected
        </div>
        <Button 
          size="sm" 
          disabled={selectedKeywords.length === 0}
          className="text-xs"
        >
          Generate Content
        </Button>
      </div>
    </div>
  );
};

export default KeywordResearch;
