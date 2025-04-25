import React, { useState, useMemo, useEffect } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import KeywordFilters, { FilterOptions } from "./KeywordFilters";
import ContentSuggestions from "./ContentSuggestions";
import KeywordSuggestions from "./KeywordSuggestions";
import { analyzeKeywords } from "@/utils/contentSuggestionUtils";
import KeywordList from "./KeywordList";
import KeywordToolbar from "./KeywordToolbar";
import { useKeywordData } from "@/hooks/useKeywordData";

interface KeywordResearchProps {
  className?: string;
  onKeywordsSelected?: (keywords: string[]) => void;
  onKeywordDataUpdate?: (data: KeywordData[]) => void;
}

const KeywordResearch: React.FC<KeywordResearchProps> = ({ 
  className,
  onKeywordsSelected,
  onKeywordDataUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isSyncingFromN8n, setIsSyncingFromN8n] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: "",
    minVolume: 0,
    maxVolume: 10000,
    minDifficulty: 0,
    maxDifficulty: 100,
    minCpc: 0,
    maxCpc: 20,
    trend: "all",
  });

  const { keywords, updateKeywords, clearKeywords } = useKeywordData(onKeywordDataUpdate);
  const { toast } = useToast();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchFromUrl = searchParams.get('search');
    
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
      setFilterOptions(prev => ({
        ...prev,
        searchTerm: searchFromUrl
      }));
    }
  }, []);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    setSearchTerm(newFilters.searchTerm);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setFilterOptions({
      ...filterOptions,
      searchTerm: newSearchTerm
    });
  };

  const filteredKeywords = useMemo(() => {
    return keywords.filter(kw => {
      const matchesSearch = kw.keyword.toLowerCase().includes(filterOptions.searchTerm.toLowerCase());
      const matchesVolume = kw.volume >= filterOptions.minVolume && kw.volume <= filterOptions.maxVolume;
      const matchesDifficulty = kw.difficulty >= filterOptions.minDifficulty && kw.difficulty <= filterOptions.maxDifficulty;
      const matchesCpc = kw.cpc >= filterOptions.minCpc && kw.cpc <= filterOptions.maxCpc;
      const matchesTrend = filterOptions.trend === "all" || kw.trend === filterOptions.trend;
      
      return matchesSearch && matchesVolume && matchesDifficulty && matchesCpc && matchesTrend;
    });
  }, [keywords, filterOptions]);

  useEffect(() => {
    setSelectedKeywords([]);
  }, [keywords]);

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  const handleGenerateContent = (keywords: string[]) => {
    if (onKeywordsSelected) {
      onKeywordsSelected(keywords);
      
      const event = new CustomEvent('navigate-to-tab', { 
        detail: { tab: 'content' } 
      });
      window.dispatchEvent(event);
      
      toast({
        title: "Keywords transferred",
        description: `${keywords.length} keywords sent to Content Generator`,
      });
    }
  };

  const handleN8nSync = async (webhookUrl: string) => {
    if (!webhookUrl) {
      toast({
        title: "Enter Webhook URL",
        description: "Please enter your n8n Webhook URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncingFromN8n(true);
    try {
      localStorage.setItem('n8n-keyword-sync-webhook-url', webhookUrl);
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: "sync_keywords", source: "lovable" }),
      });

      if (!resp.ok) throw new Error("n8n workflow did not respond successfully");

      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error("Unexpected n8n response");
      if (!data[0]?.keyword) throw new Error("No keyword data returned");

      updateKeywords(data);
      toast({
        title: "Keywords Synced",
        description: `Imported ${data.length} keywords from n8n workflow.`,
      });
    } catch (err: any) {
      toast({
        title: "Sync failed",
        description: err.message || "Failed to sync keywords from n8n.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingFromN8n(false);
    }
  };

  const handleSemrushKeywords = (newKeywords: KeywordData[]) => {
    if (newKeywords && newKeywords.length > 0) {
      console.log(`KeywordResearch received ${newKeywords.length} keywords from SEMrush`);
      
      updateKeywords(newKeywords);
      
      setSelectedKeywords([]);
    }
  };

  const suggestions = useMemo(() => {
    return analyzeKeywords(filteredKeywords);
  }, [filteredKeywords]);

  return (
    <div className={className}>
      <KeywordToolbar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchInputChange}
        onClearData={clearKeywords}
        onSemrushKeywords={handleSemrushKeywords}
        isSyncingFromN8n={isSyncingFromN8n}
        onN8nSync={handleN8nSync}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <KeywordList
              keywords={filteredKeywords}
              selectedKeywords={selectedKeywords}
              onKeywordToggle={toggleKeywordSelection}
              onGenerateContent={handleGenerateContent}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <KeywordFilters onFiltersChange={handleFilterChange} />
        </div>
      </div>
      
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Content Suggestions</h3>
          <KeywordSuggestions suggestions={suggestions} />
        </div>
      </div>
    </div>
  );
};

export default KeywordResearch;
