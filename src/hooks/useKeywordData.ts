
import { useState, useEffect } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = 'office-space-keywords';

const mockKeywords: KeywordData[] = [
  { keyword: "office space management software", volume: 5400, difficulty: 78, cpc: 14.5, trend: "up" },
  { keyword: "workspace management system", volume: 3800, difficulty: 65, cpc: 9.20, trend: "up" },
  { keyword: "office floor plan software", volume: 6200, difficulty: 72, cpc: 12.75, trend: "up" },
  { keyword: "desk booking system", volume: 7900, difficulty: 68, cpc: 11.50, trend: "up" },
  { keyword: "workplace analytics tools", volume: 2900, difficulty: 54, cpc: 8.80, trend: "neutral" },
  { keyword: "hybrid workplace management", volume: 4100, difficulty: 70, cpc: 13.25, trend: "up" },
  { keyword: "space utilization software", volume: 3200, difficulty: 62, cpc: 10.40, trend: "neutral" },
  { keyword: "office hoteling software", volume: 2800, difficulty: 55, cpc: 9.60, trend: "up" },
  { keyword: "facility management software", volume: 8500, difficulty: 85, cpc: 15.90, trend: "up" },
  { keyword: "room reservation system", volume: 5600, difficulty: 67, cpc: 10.20, trend: "neutral" },
];

export const useKeywordData = (onKeywordDataUpdate?: (data: KeywordData[]) => void) => {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedKeywords = localStorage.getItem(STORAGE_KEY);
    if (savedKeywords) {
      try {
        const parsedKeywords = JSON.parse(savedKeywords) as KeywordData[];
        setKeywords(parsedKeywords);
        toast({
          title: "Keywords Loaded",
          description: `Loaded ${parsedKeywords.length} keywords from your saved data.`,
        });
      } catch (error) {
        console.error("Error loading saved keywords:", error);
        setKeywords(mockKeywords);
      }
    } else {
      setKeywords(mockKeywords);
    }
  }, [toast]);

  useEffect(() => {
    if (keywords.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
    }
  }, [keywords]);

  useEffect(() => {
    if (onKeywordDataUpdate) {
      onKeywordDataUpdate(keywords);
    }
  }, [keywords, onKeywordDataUpdate]);

  const updateKeywords = (newKeywords: KeywordData[]) => {
    setKeywords(prevKeywords => {
      const keywordMap = new Map(prevKeywords.map(k => [k.keyword, k]));
      newKeywords.forEach(k => keywordMap.set(k.keyword, k));
      return Array.from(keywordMap.values());
    });
  };

  const clearKeywords = () => {
    if (window.confirm("Are you sure you want to clear all keyword data? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      setKeywords(mockKeywords);
      return true;
    }
    return false;
  };

  return { keywords, updateKeywords, clearKeywords };
};
