
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicAreaSelector } from "./TopicAreaSelector";
import SemrushIntegration from "./SemrushIntegration";
import { KeywordData } from "@/utils/excelUtils";

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
          Enter your topic area and domain to find relevant keywords from SEMrush
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
          disabled={!selectedTopicArea.trim()}
        />
      </CardContent>
    </Card>
  );
};

export default TopicKeywordFetcher;
