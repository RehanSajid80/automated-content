
import React from 'react';
import KeywordResearch from './KeywordResearch';
import ContentGenerator from './ContentGenerator';
import { KeywordData } from '@/utils/excelUtils';

interface ContentSectionProps {
  selectedKeywords: string[];
  onKeywordsSelected: (keywords: string[]) => void;
  onKeywordDataUpdate: (data: KeywordData[]) => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  selectedKeywords,
  onKeywordsSelected,
  onKeywordDataUpdate,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h3 className="text-xl font-semibold">Keyword Selection & Content Generation</h3>
          <p className="text-muted-foreground">
            Select keywords from your SEMrush data to generate optimized content
          </p>
        </div>

        <KeywordResearch 
          onKeywordsSelected={onKeywordsSelected} 
          onKeywordDataUpdate={onKeywordDataUpdate}
        />

        {selectedKeywords.length > 0 && (
          <div className="pt-6 border-t border-border">
            <ContentGenerator keywords={selectedKeywords} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSection;
