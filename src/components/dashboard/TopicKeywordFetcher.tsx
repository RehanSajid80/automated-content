
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicAreaSelector } from "./TopicAreaSelector";
import SemrushIntegration from "./SemrushIntegration";
import { KeywordData } from "@/utils/excelUtils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TopicKeywordFetcherProps {
  onKeywordsReceived: (keywords: KeywordData[], topicArea?: string, domain?: string) => void;
  onToggleAdvanced: () => void;
  showAdvanced: boolean;
}

const TopicKeywordFetcher: React.FC<TopicKeywordFetcherProps> = ({
  onKeywordsReceived,
  onToggleAdvanced,
  showAdvanced
}) => {
  const [selectedTopicArea, setSelectedTopicArea] = useState("");
  const [currentDomain, setCurrentDomain] = useState("");

  const handleKeywordsReceived = (keywords: KeywordData[]) => {
    // Pass the topic area and domain along with the keywords
    onKeywordsReceived(keywords, selectedTopicArea, currentDomain);
  };

  const handleDomainChange = (domain: string) => {
    setCurrentDomain(domain);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Research</CardTitle>
        <CardDescription>
          Start by selecting a topic area and domain to find relevant keywords
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TopicAreaSelector 
          value={selectedTopicArea}
          onChange={setSelectedTopicArea}
        />
        
        <SemrushIntegration 
          onKeywordsReceived={handleKeywordsReceived}
          topicArea={selectedTopicArea}
          onDomainChange={handleDomainChange}
        />
        
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onToggleAdvanced}
            className="w-full"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide Advanced Options
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show Advanced Options
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicKeywordFetcher;
