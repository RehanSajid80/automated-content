
import { useState, useCallback } from "react";
import { FilterOptions } from "@/components/dashboard/KeywordFilters";
import { KeywordData } from "@/utils/excelUtils";

export const useKeywordFilters = (keywords: KeywordData[]) => {
  const [searchTerm, setSearchTerm] = useState("");
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

  // Handle filter changes from FilterOptions component
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    // Don't update search term here to avoid loops
  }, []);

  // Handle search input changes directly
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    
    // Update search term state
    setSearchTerm(newSearchTerm);
    
    // Update filter searchTerm to match
    setFilterOptions(prev => ({
      ...prev,
      searchTerm: newSearchTerm
    }));
  }, []);

  // Filter keywords based on current filter options
  const filteredKeywords = keywords.filter(kw => {
    const matchesSearch = kw.keyword.toLowerCase().includes(filterOptions.searchTerm.toLowerCase());
    const matchesVolume = kw.volume >= filterOptions.minVolume && kw.volume <= filterOptions.maxVolume;
    const matchesDifficulty = kw.difficulty >= filterOptions.minDifficulty && kw.difficulty <= filterOptions.maxDifficulty;
    const matchesCpc = kw.cpc >= filterOptions.minCpc && kw.cpc <= filterOptions.maxCpc;
    const matchesTrend = filterOptions.trend === "all" || kw.trend === filterOptions.trend;
    
    return matchesSearch && matchesVolume && matchesDifficulty && matchesCpc && matchesTrend;
  });

  return { 
    searchTerm, 
    filterOptions, 
    filteredKeywords, 
    handleFilterChange, 
    handleSearchInputChange 
  };
};
