
import { useState, useEffect } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { getFromCache, storeInCache } from "@/utils/contentLifecycleUtils";

const STORAGE_KEY = 'office-space-keywords';
const CACHE_KEY = 'keyword-data-cache';

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
    // First check for data in memory cache
    const cachedKeywords = getFromCache<KeywordData[]>(CACHE_KEY);
    if (cachedKeywords && cachedKeywords.length > 0) {
      console.log(`Retrieved ${cachedKeywords.length} keywords from memory cache`);
      setKeywords(cachedKeywords);
      return;
    }
    
    // Then check localStorage
    const savedKeywords = localStorage.getItem(STORAGE_KEY);
    if (savedKeywords) {
      try {
        const parsedKeywords = JSON.parse(savedKeywords) as KeywordData[];
        console.log(`Loaded ${parsedKeywords.length} keywords from localStorage`);
        setKeywords(parsedKeywords);
        // Store in memory cache for faster access later
        storeInCache(CACHE_KEY, parsedKeywords);
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
      // Update in-memory cache too
      storeInCache(CACHE_KEY, keywords);
      console.log(`Saved ${keywords.length} keywords to localStorage and memory cache`);
    }
  }, [keywords]);

  useEffect(() => {
    if (onKeywordDataUpdate) {
      onKeywordDataUpdate(keywords);
    }
  }, [keywords, onKeywordDataUpdate]);

  const updateKeywords = (newKeywords: KeywordData[]) => {
    console.log(`Updating keywords with ${newKeywords.length} new entries`);
    
    setKeywords(prevKeywords => {
      // Create a map from previous keywords for easy lookup
      const keywordMap = new Map(prevKeywords.map(k => [k.keyword.toLowerCase(), k]));
      
      // Update map with new keywords
      newKeywords.forEach(k => {
        if (k && k.keyword) {
          keywordMap.set(k.keyword.toLowerCase(), k);
        }
      });
      
      // Convert map back to array
      const updatedKeywords = Array.from(keywordMap.values());
      console.log(`Updated keywords list now contains ${updatedKeywords.length} entries`);
      return updatedKeywords;
    });
    
    toast({
      title: "Keywords Updated",
      description: `Added or updated ${newKeywords.length} keywords in your workspace.`,
    });
  };

  const clearKeywords = () => {
    if (window.confirm("Are you sure you want to clear all keyword data? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      // Also clear from memory cache
      storeInCache(CACHE_KEY, []);
      setKeywords(mockKeywords);
      toast({
        title: "Keywords Reset",
        description: "Your keyword data has been reset to the default sample data.",
      });
      return true;
    }
    return false;
  };

  return { keywords, updateKeywords, clearKeywords };
};
