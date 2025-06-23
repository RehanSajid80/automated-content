
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Settings, Sparkles } from "lucide-react";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TopicKeywordFetcherProps {
  onKeywordsReceived: (keywords: KeywordData[]) => void;
  onToggleAdvanced: () => void;
  showAdvanced: boolean;
}

const TopicKeywordFetcher: React.FC<TopicKeywordFetcherProps> = ({
  onKeywordsReceived,
  onToggleAdvanced,
  showAdvanced
}) => {
  const [topic, setTopic] = useState('');
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFetchKeywords = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic to search for keywords",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get keyword limit from settings
      const keywordLimit = parseInt(localStorage.getItem('semrush-keyword-limit') || '100', 10);
      
      console.log(`Fetching keywords for topic: "${topic}" with domain context: "${domain}"`);

      // Call SEMrush API through edge function
      const { data, error } = await supabase.functions.invoke('semrush-keywords', {
        body: { 
          keyword: topic.trim(), // Use topic as the search keyword
          domain: domain.trim() || 'example.com', // Use provided domain or fallback
          limit: keywordLimit,
          topicArea: 'general' 
        }
      });

      if (error) {
        console.error('Function error:', error);
        throw new Error(error.message || "Failed to fetch keywords");
      }

      if (data.error) {
        console.error('API error from SEMrush:', data.error);
        
        let errorMessage = data.error;
        if (data.error.includes('NOTHING FOUND')) {
          errorMessage = `No keywords found for "${topic}". Try different or broader search terms.`;
        }
        
        toast({
          title: "No Keywords Found",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Process the keywords
      const keywordsArray = data.keywords || [];
      
      if (keywordsArray.length === 0) {
        toast({
          title: "No Keywords Found",
          description: `No keywords found for "${topic}". Try broader or different terms.`,
          variant: "default",
        });
        return;
      }

      // Format keywords consistently
      const formattedKeywords: KeywordData[] = keywordsArray.map((kw: any) => ({
        keyword: kw.keyword,
        volume: kw.volume || 0,
        difficulty: kw.difficulty || 50,
        cpc: kw.cpc || 0,
        trend: kw.trend || 'neutral'
      }));
      
      console.log(`Processed ${formattedKeywords.length} keywords for topic: "${topic}"`);
      
      onKeywordsReceived(formattedKeywords);
      
      toast({
        title: "Keywords Loaded",
        description: `Found ${formattedKeywords.length} keywords related to "${topic}"`,
      });
      
    } catch (error) {
      console.error('Error fetching keywords:', error);
      
      let errorMessage = "Failed to fetch keywords";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleFetchKeywords();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Find Keywords for Your Topic
        </CardTitle>
        <CardDescription>
          Enter a topic to discover relevant keywords for content creation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic-input">Topic or Subject</Label>
          <Input
            id="topic-input"
            placeholder="e.g., office space management, coworking trends, workspace productivity"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain-input">Domain (Optional)</Label>
          <Input
            id="domain-input"
            placeholder="e.g., officespacesoftware.com (for competitive analysis)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="flex gap-2 items-center">
          <Button 
            onClick={handleFetchKeywords}
            disabled={isLoading || !topic.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Finding Keywords...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Keywords
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onToggleAdvanced}
            size="sm"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Advanced'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicKeywordFetcher;
