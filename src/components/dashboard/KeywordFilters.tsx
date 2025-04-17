
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeywordData } from "@/utils/excelUtils";

interface KeywordFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export interface FilterOptions {
  searchTerm: string;
  minVolume: number;
  maxVolume: number;
  minDifficulty: number;
  maxDifficulty: number;
  minCpc: number;
  maxCpc: number;
  trend: "all" | "up" | "neutral" | "down";
}

const KeywordFilters: React.FC<KeywordFiltersProps> = ({
  onFiltersChange,
  className,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    minVolume: 0,
    maxVolume: 10000,
    minDifficulty: 0,
    maxDifficulty: 100,
    minCpc: 0,
    maxCpc: 20,
    trend: "all",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleTrendChange = (value: string) => {
    const newFilters = {
      ...filters,
      trend: value as "all" | "up" | "neutral" | "down",
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleVolumeChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      minVolume: value[0],
      maxVolume: value[1],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDifficultyChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      minDifficulty: value[0],
      maxDifficulty: value[1],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCpcChange = (value: number[]) => {
    const newFilters = {
      ...filters,
      minCpc: value[0],
      maxCpc: value[1],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      searchTerm: "",
      minVolume: 0,
      maxVolume: 10000,
      minDifficulty: 0,
      maxDifficulty: 100,
      minCpc: 0,
      maxCpc: 20,
      trend: "all" as const,
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  return (
    <div className={`space-y-4 p-4 border rounded-lg bg-card ${className}`}>
      <h3 className="text-lg font-semibold mb-2">Filter Keywords</h3>
      
      <div>
        <label className="text-sm font-medium mb-1 block">Keyword Search</label>
        <Input
          name="searchTerm"
          value={filters.searchTerm}
          onChange={handleInputChange}
          placeholder="Search keywords..."
          className="w-full"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">
          Volume Range: {filters.minVolume} - {filters.maxVolume}
        </label>
        <Slider
          defaultValue={[filters.minVolume, filters.maxVolume]}
          max={10000}
          step={100}
          onValueChange={handleVolumeChange}
          className="my-4"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">
          Difficulty Range: {filters.minDifficulty} - {filters.maxDifficulty}
        </label>
        <Slider
          defaultValue={[filters.minDifficulty, filters.maxDifficulty]}
          max={100}
          step={1}
          onValueChange={handleDifficultyChange}
          className="my-4"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">
          CPC Range: ${filters.minCpc.toFixed(2)} - ${filters.maxCpc.toFixed(2)}
        </label>
        <Slider
          defaultValue={[filters.minCpc, filters.maxCpc]}
          max={20}
          step={0.1}
          onValueChange={handleCpcChange}
          className="my-4"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1 block">Trend</label>
        <Select 
          value={filters.trend} 
          onValueChange={handleTrendChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select trend" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trends</SelectItem>
            <SelectItem value="up">Upward Trend</SelectItem>
            <SelectItem value="neutral">Neutral Trend</SelectItem>
            <SelectItem value="down">Downward Trend</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Button onClick={applyFilters} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={resetFilters} variant="outline" className="flex-1">
          Reset
        </Button>
      </div>
    </div>
  );
};

export default KeywordFilters;
