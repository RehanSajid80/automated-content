
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordData } from "@/utils/excelUtils";

interface SemrushIntegrationProps {
  onKeywordsReceived: (keywords: KeywordData[]) => void;
}

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
      // Validate domain input
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/;
      const cleanDomain = domain.replace(/^https?:\/\/(www\.)?/i, '');
      
      if (!domainRegex.test(cleanDomain)) {
        throw new Error("Please enter a valid domain (e.g., example.com)");
      }

      console.log(`Fetching keywords for domain: ${cleanDomain}`);
      
      const { data, error } = await supabase.functions.invoke('semrush-keywords', {
        body: { keyword: cleanDomain, limit: 20 }
      });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || "Failed to fetch keywords");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.keywords || !Array.isArray(data.keywords)) {
        throw new Error("Invalid response from SEMrush API");
      }

      console.log(`Received ${data.keywords.length} keywords from edge function`);
      onKeywordsReceived(data.keywords);
      
      toast({
        title: "Success",
        description: `Fetched ${data.keywords.length} keywords. ${data.remaining} API calls remaining today.`,
      });
    } catch (error) {
      console.error('Error fetching keywords:', error);
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
        <Search className="w-4 h-4 mr-2" />
        {isLoading ? "Fetching..." : "Fetch Keywords"}
      </Button>
    </div>
  );
};

export default SemrushIntegration;
