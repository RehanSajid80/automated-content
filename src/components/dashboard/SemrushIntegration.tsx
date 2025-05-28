
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Database, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/utils/excelUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SemrushIntegrationProps {
  onKeywordsReceived: (keywords: KeywordData[]) => void;
  topicArea?: string;
  disabled?: boolean;
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

const SemrushIntegration: React.FC<SemrushIntegrationProps> = ({ 
  onKeywordsReceived,
  topicArea,
  disabled = false
}) => {
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
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

  const getKeywordLimit = (): number => {
    const savedLimit = localStorage.getItem('semrush-keyword-limit');
    return savedLimit ? parseInt(savedLimit, 10) : 100;
  };

  const fetchKeywords = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a keyword to search for",
        variant: "destructive",
      });
      return;
    }

    if (!domain.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setApiStatus(null);

    try {
      const cleanDomain = extractDomain(domain);
      const keywordLimit = getKeywordLimit();
      
      console.log(`Fetching keywords for keyword: "${keyword}" and domain: ${cleanDomain}`);
      console.log(`Requesting ${keywordLimit} keywords from SEMrush API (from settings)`);

      // Call SEMrush API through edge function with keyword and domain
      const { data, error } = await supabase.functions.invoke('semrush-keywords', {
        body: { 
          keyword: keyword.trim(),
          domain: cleanDomain,
          limit: keywordLimit,
          topicArea: topicArea || '' 
        }
      });

      if (error) {
        console.error('Function error:', error);
        updateSemrushMetrics(false);
        setErrorMsg(`Function error: ${error.message || "Unknown error"}`);
        setApiStatus('error');
        throw new Error(error.message || "Failed to fetch keywords");
      }

      if (data.error) {
        console.error('API error:', data.error);
        updateSemrushMetrics(false);
        setErrorMsg(`API error: ${data.error}`);
        setApiStatus(data.apiKeyStatus || 'error');
        throw new Error(data.error);
      }

      // Set API status based on response
      setApiStatus(data.apiKeyStatus || 'working');

      // Process response - handle both formats where keywords might be directly in data or in data.keywords
      let keywordsArray = data.keywords || data;
      
      // Check if we got any keywords back
      if (!keywordsArray || !Array.isArray(keywordsArray) || keywordsArray.length === 0) {
        console.warn('No keywords found:', data);
        updateSemrushMetrics(false);
        setErrorMsg(`No keywords found for "${keyword}" related to ${cleanDomain}`);
        toast({
          title: "No keywords found",
          description: `Try a different keyword or check if the domain has organic search presence for "${keyword}"`,
          variant: "default",
        });
        setIsLoading(false);
        return;
      }

      console.log(`Received ${keywordsArray.length} keywords from SEMrush API`);
      updateSemrushMetrics(true);

      // Format keywords consistently before passing them to the callback
      const formattedKeywords: KeywordData[] = keywordsArray.map(kw => ({
        keyword: kw.keyword,
        volume: kw.volume || 0,
        difficulty: kw.difficulty || 50,
        cpc: kw.cpc || 0,
        trend: kw.trend || 'neutral'
      }));
      
      console.log(`Processed ${formattedKeywords.length} keywords from SEMrush for keyword: "${keyword}" and domain: ${cleanDomain}`);
      
      onKeywordsReceived(formattedKeywords);
      
      const statusMessage = data.fromCache ? "Loaded from cache" : "Success";
      const duplicatesInfo = data.duplicatesIgnored > 0 ? ` (${data.duplicatesIgnored} duplicates ignored)` : '';
      
      toast({
        title: statusMessage,
        description: `${data.fromCache ? "Retrieved" : "Fetched"} ${formattedKeywords.length} keywords for "${keyword}" related to ${cleanDomain} (limit: ${keywordLimit}). ${data.insertedCount !== undefined ? `${data.insertedCount} new entries saved.` : ''}${duplicatesInfo} ${data.remaining || 100} API calls remaining today.`,
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

  const keywordLimit = getKeywordLimit();

  const renderApiStatus = () => {
    if (!apiStatus) return null;
    
    if (apiStatus === 'working') {
      return (
        <Alert className="mt-2">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>SEMrush API key is working correctly</AlertDescription>
        </Alert>
      );
    } else if (apiStatus === 'configured') {
      return (
        <Alert className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>SEMrush API key is configured but check keyword/domain validity</AlertDescription>
        </Alert>
      );
    } else if (apiStatus === 'missing') {
      return (
        <Alert variant="destructive" className="mt-2">
          <XCircle className="h-4 w-4" />
          <AlertDescription>SEMrush API key is not configured in Supabase secrets</AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2">
        <Input
          type="text"
          placeholder="Enter keyword (e.g., asset management)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-sm"
          disabled={disabled}
        />
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Enter domain (e.g., officespacesoftware.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="max-w-sm"
            disabled={disabled}
          />
          <Button 
            onClick={fetchKeywords} 
            disabled={isLoading || disabled}
            variant="outline"
            title={`Will fetch ${keywordLimit} keywords for the specified keyword and domain`}
          >
            {isLoading ? (
              <>
                <Database className="w-4 h-4 mr-2 animate-spin" />
                Testing API...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Fetch Keywords ({keywordLimit})
              </>
            )}
          </Button>
        </div>
      </div>
      
      {renderApiStatus()}
      
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
