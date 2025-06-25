
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/utils/excelUtils";
import { getApiKey } from "@/utils/apiKeyUtils";

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

const getKeywordLimit = async (): Promise<number> => {
  try {
    // Try to get global keyword limit first
    const globalLimit = await getApiKey('semrush-keyword-limit');
    if (globalLimit) {
      const parsedLimit = parseInt(globalLimit, 10);
      if (!isNaN(parsedLimit)) {
        return parsedLimit;
      }
    }
  } catch (error) {
    console.error('Error loading global keyword limit:', error);
  }
  
  // Fallback to localStorage
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
  const [keywordLimit, setKeywordLimit] = useState(100);
  const { toast } = useToast();

  // Load keyword limit on component mount
  React.useEffect(() => {
    const loadLimit = async () => {
      const limit = await getKeywordLimit();
      setKeywordLimit(limit);
    };
    loadLimit();
  }, []);

  const fetchKeywords = async () => {
    // Updated validation: require either domain OR keyword/topicArea
    const hasKeyword = keyword.trim() || topicArea?.trim();
    const hasDomain = domain.trim();
    
    if (!hasKeyword && !hasDomain) {
      toast({
        title: "Error",
        description: "Please enter either a keyword/topic area or a domain URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setApiStatus(null);

    try {
      const currentKeywordLimit = await getKeywordLimit();
      
      // Use keyword if provided, otherwise empty string for domain analysis
      const searchKeyword = keyword.trim() || topicArea?.trim() || '';
      
      // Handle domain - can be empty now
      let cleanDomain = '';
      if (hasDomain) {
        cleanDomain = extractDomain(domain);
        
        // Validate domain format only if domain is provided
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
        if (!domainRegex.test(cleanDomain)) {
          throw new Error(`Invalid domain format: ${cleanDomain}. Please enter a valid domain like "example.com"`);
        }
      }
      
      console.log(`Fetching keywords for: ${searchKeyword ? `keyword: "${searchKeyword}"` : 'general search'}${cleanDomain ? ` and domain: ${cleanDomain}` : ''}`);
      console.log(`Requesting ${currentKeywordLimit} keywords from SEMrush API (from global settings)`);

      // Call SEMrush API through edge function with keyword and domain (domain can be empty)
      const { data, error } = await supabase.functions.invoke('semrush-keywords', {
        body: { 
          keyword: searchKeyword,
          domain: cleanDomain, // Can be empty string now
          limit: currentKeywordLimit,
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

      console.log('SEMrush API response:', data);

      if (data.error) {
        console.error('API error from SEMrush:', data.error);
        updateSemrushMetrics(false);
        
        // More specific error handling
        let errorMessage = data.error;
        if (data.error.includes('NOTHING FOUND') || data.error.includes('No keywords found')) {
          errorMessage = searchKeyword 
            ? `No keywords found for "${searchKeyword}". Try broader search terms like "office space", "workspace", or "asset management".`
            : `No organic keywords found${cleanDomain ? ` for ${cleanDomain}` : ''}. Try different search terms.`;
        } else if (data.error.includes('Invalid API key')) {
          errorMessage = 'SEMrush API key is invalid. Please check your API key configuration.';
        } else if (data.error.includes('domain format')) {
          errorMessage = `Invalid domain format. Please enter a valid domain like "example.com"`;
        }
        
        setErrorMsg(errorMessage);
        setApiStatus(data.apiKeyStatus || 'configured');
        
        // Show suggestions if available
        let description = errorMessage;
        if (data.suggestions && data.suggestions.length > 0) {
          description += '\n\nSuggestions:\n• ' + data.suggestions.join('\n• ');
        }
        
        toast({
          title: "No Keywords Found",
          description: description,
          variant: "default",
        });
        
        setIsLoading(false);
        return;
      }

      // Set API status based on response
      setApiStatus(data.apiKeyStatus || 'working');

      // Process response - handle both formats where keywords might be directly in data or in data.keywords
      let keywordsArray = data.keywords || data;
      
      // Check if we got any keywords back
      if (!keywordsArray || !Array.isArray(keywordsArray) || keywordsArray.length === 0) {
        console.warn('No keywords found in response:', data);
        updateSemrushMetrics(false);
        const noResultsMessage = searchKeyword 
          ? `No keywords found for "${searchKeyword}". Try broader terms like "office space", "workspace", or "facility management".` 
          : `No organic keywords found${cleanDomain ? ` for ${cleanDomain}` : ''}. Try different search terms.`;
        setErrorMsg(noResultsMessage);
        toast({
          title: "No keywords found",
          description: searchKeyword 
            ? `Try using broader terms like "office space", "workspace", or check spelling.`
            : `Try adding a specific keyword or domain for better results`,
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
      
      console.log(`Processed ${formattedKeywords.length} keywords from SEMrush for ${searchKeyword ? `keyword: "${searchKeyword}"` : 'general search'}${cleanDomain ? ` and domain: ${cleanDomain}` : ''}`);
      
      onKeywordsReceived(formattedKeywords);
      
      const statusMessage = data.fromCache ? "Loaded from cache" : "Success";
      const duplicatesInfo = data.duplicatesIgnored > 0 ? ` (${data.duplicatesIgnored} duplicates ignored)` : '';
      const analysisType = searchKeyword ? `keywords for "${searchKeyword}"` : 'general keywords';
      
      toast({
        title: statusMessage,
        description: `${data.fromCache ? "Retrieved" : "Fetched"} ${formattedKeywords.length} ${analysisType}${cleanDomain ? ` for ${cleanDomain}` : ''} (limit: ${currentKeywordLimit}). ${data.insertedCount !== undefined ? `${data.insertedCount} new entries saved.` : ''}${duplicatesInfo} ${data.remaining || 100} API calls remaining today.`,
      });
      
    } catch (error) {
      console.error('Error fetching keywords:', error);
      updateSemrushMetrics(false);
      
      let errorMessage = "Failed to fetch keywords";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrorMsg(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
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
    keywordLimit,
    setKeyword,
    setDomain,
    fetchKeywords
  };
};
