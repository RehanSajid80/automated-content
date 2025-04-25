
import { useState, useEffect } from 'react';
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { getFromCache, storeInCache, clearCache } from "@/utils/contentLifecycleUtils";

const STORAGE_KEY = 'office-space-keywords';
const CACHE_KEY = 'keyword-data-cache';

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
        setKeywords([]);
      }
    } else {
      setKeywords([]);
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
    
    // Clear both cache and localStorage before updating
    clearCache(CACHE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    
    setKeywords(newKeywords);  // Directly set the new keywords
    
    toast({
      title: "Keywords Updated",
      description: `Added ${newKeywords.length} keywords to your workspace.`,
    });
  };

  const clearKeywords = () => {
    if (window.confirm("Are you sure you want to clear all keyword data? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      clearCache(CACHE_KEY);
      setKeywords([]);
      toast({
        title: "Keywords Reset",
        description: "Your keyword data has been cleared.",
      });
      return true;
    }
    return false;
  };

  return { keywords, updateKeywords, clearKeywords };
};
