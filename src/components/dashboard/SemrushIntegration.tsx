
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Database, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/utils/excelUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract domain from URL if full URL is pasted
  const extractDomain = (input: string): string => {
    try {
      // Check if it's already a valid domain without protocol
      if (/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(input)) {
        return input;
      }
      
      // Try to extract domain from URL
      if (input.startsWith('http')) {
        const url = new URL(input);
        return url.hostname;
      }
      
      // If not starting with http, try adding it and parse
      const url = new URL('https://' + input);
      return url.hostname;
    } catch (e) {
      // If all fails, return the input as is
      return input;
    }
  };

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
    setErrorMsg(null);

    try {
      const cleanDomain = extractDomain(domain);
      console.log(`Fetching keywords for domain: ${cleanDomain}`);
      
      const { data, error } = await supabase.functions.invoke('semrush-keywords', {
        body: { keyword: cleanDomain, limit: 30 }
      });

      if (error) {
        console.error('Function error:', error);
        updateSemrushMetrics(false);
        setErrorMsg(`Function error: ${error.message || "Unknown error"}`);
        throw new Error(error.message || "Failed to fetch keywords");
      }

      if (data.error) {
        console.error('API error:', data.error);
        updateSemrushMetrics(false);
        setErrorMsg(`API error: ${data.error}`);
        throw new Error(data.error);
      }

      // Check if we got any keywords back
      if (!data.keywords || !Array.isArray(data.keywords) || data.keywords.length === 0) {
        console.warn('No keywords returned:', data);
        updateSemrushMetrics(false);
        setErrorMsg("No keywords found for this domain");
        toast({
          title: "No keywords found",
          description: "Try a different domain with more organic search presence",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }

      updateSemrushMetrics(true);

      // Process keywords and format them correctly for the application
      const formattedKeywords: KeywordData[] = data.keywords.map(kw => ({
        keyword: kw.keyword,
        volume: kw.volume || 0,
        difficulty: kw.difficulty || 50,
        cpc: kw.cpc || 0,
        trend: kw.trend || 'neutral'
      }));
      
      console.log(`Processed ${formattedKeywords.length} keywords from SEMrush`);
      
      // Call the callback function with the new keywords
      onKeywordsReceived(formattedKeywords);
      
      toast({
        title: data.fromCache ? "Loaded from cache" : "Success",
        description: `${data.fromCache ? "Retrieved" : "Fetched"} ${formattedKeywords.length} keywords. ${data.insertedCount !== undefined ? `${data.insertedCount} new entries saved.` : ''} ${data.remaining} API calls remaining today.`,
      });
      
      // Log to verify data is being passed
      console.log(`Passing ${formattedKeywords.length} keywords to parent component`, formattedKeywords);
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
    <div className="space-y-2">
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
              Loading...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Fetch Keywords
            </>
          )}
        </Button>
      </div>
      
      {errorMsg && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SemrushIntegration;
