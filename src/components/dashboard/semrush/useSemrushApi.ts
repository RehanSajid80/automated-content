
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/utils/excelUtils";

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

export const useSemrushApi = (
  onKeywordsReceived: (keywords: KeywordData[]) => void,
  topicArea?: string
) => {
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchKeywords = async () => {
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
      
      // Use keyword if provided, otherwise empty string for domain analysis
      const searchKeyword = keyword.trim();
      
      console.log(`Fetching ${searchKeyword ? 'keyword-specific' : 'domain overview'} data for domain: ${cleanDomain}${searchKeyword ? ` with keyword: "${searchKeyword}"` : ''}`);
      console.log(`Requesting ${keywordLimit} keywords from SEMrush API (from settings)`);

      // Call SEMrush API through edge function with keyword and domain
      const { data, error } = await supabase.functions.invoke('semrush-keywords', {
        body: { 
          keyword: searchKeyword,
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
        const noResultsMessage = searchKeyword 
          ? `No keywords found for "${searchKeyword}" related to ${cleanDomain}` 
          : `No organic keywords found for ${cleanDomain}`;
        setErrorMsg(noResultsMessage);
        toast({
          title: "No keywords found",
          description: searchKeyword 
            ? `Try a different keyword or check if the domain has organic search presence for "${searchKeyword}"`
            : `The domain may not have sufficient organic visibility or try adding a specific keyword`,
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
      
      console.log(`Processed ${formattedKeywords.length} keywords from SEMrush for ${searchKeyword ? `keyword: "${searchKeyword}" and ` : ''}domain: ${cleanDomain}`);
      
      onKeywordsReceived(formattedKeywords);
      
      const statusMessage = data.fromCache ? "Loaded from cache" : "Success";
      const duplicatesInfo = data.duplicatesIgnored > 0 ? ` (${data.duplicatesIgnored} duplicates ignored)` : '';
      const analysisType = searchKeyword ? `keyword "${searchKeyword}"` : 'domain overview';
      
      toast({
        title: statusMessage,
        description: `${data.fromCache ? "Retrieved" : "Fetched"} ${formattedKeywords.length} keywords for ${analysisType} related to ${cleanDomain} (limit: ${keywordLimit}). ${data.insertedCount !== undefined ? `${data.insertedCount} new entries saved.` : ''}${duplicatesInfo} ${data.remaining || 100} API calls remaining today.`,
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

  return {
    keyword,
    domain,
    isLoading,
    errorMsg,
    apiStatus,
    keywordLimit: getKeywordLimit(),
    setKeyword,
    setDomain,
    fetchKeywords
  };
};
