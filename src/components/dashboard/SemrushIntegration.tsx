
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Database, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/utils/excelUtils";

interface SemrushIntegrationProps {
  onKeywordsReceived: (keywords: KeywordData[]) => void;
}

// Function to update SEMrush API metrics
const updateSemrushMetrics = (success: boolean) => {
  const metrics = localStorage.getItem('semrush-api-metrics');
  let currentMetrics = metrics ? JSON.parse(metrics) : {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    lastCall: null
  };

  currentMetrics.totalCalls += 1;
  if (success) {
    currentMetrics.successfulCalls += 1;
  } else {
    currentMetrics.failedCalls += 1;
  }
  currentMetrics.lastCall = new Date().toISOString();

  localStorage.setItem('semrush-api-metrics', JSON.stringify(currentMetrics));
};

const SemrushIntegration: React.FC<SemrushIntegrationProps> = ({ onKeywordsReceived }) => {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchKeywords = async () => {
    if (!domain) {
      toast({
        title: "Error",
        description: "Please enter a domain",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Clean the domain by removing protocol and www
      const cleanDomain = domain.replace(/^https?:\/\/(www\.)?/i, '');
      console.log(`Fetching keywords for domain: ${cleanDomain}`);
      
      const { data, error } = await supabase.functions.invoke('semrush-keywords', {
        body: { keyword: cleanDomain, limit: 30 }
      });

      if (error) {
        console.error('Function error:', error);
        updateSemrushMetrics(false);
        throw new Error(error.message || "Failed to fetch keywords");
      }

      if (data.error) {
        updateSemrushMetrics(false);
        throw new Error(data.error);
      }

      if (!data.keywords || !Array.isArray(data.keywords)) {
        updateSemrushMetrics(false);
        throw new Error("Invalid response from SEMrush API");
      }

      updateSemrushMetrics(true);

      const formattedKeywords: KeywordData[] = data.keywords.map(kw => ({
        keyword: kw.keyword,
        volume: kw.volume,
        difficulty: kw.difficulty,
        cpc: kw.cpc,
        trend: kw.trend
      }));
      
      onKeywordsReceived(formattedKeywords);
      
      toast({
        title: data.fromCache ? "Loaded from cache" : "Success",
        description: `${data.fromCache ? "Retrieved" : "Fetched"} ${data.keywords.length} keywords. ${data.remaining} API calls remaining today.`,
      });
    } catch (error) {
      console.error('Error fetching keywords:', error);
      updateSemrushMetrics(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch keywords",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        type="text"
        placeholder="Enter domain (e.g., example.com)"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        className="max-w-sm"
      />
      <Button 
        onClick={fetchKeywords} 
        disabled={isLoading}
        variant="outline"
      >
        {isLoading ? (
          <>
            <Database className="w-4 h-4 mr-2 animate-spin" />
            {isLoading ? "Fetching..." : "Fetch Keywords"}
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Fetch Keywords
          </>
        )}
      </Button>
    </div>
  );
};

export default SemrushIntegration;
