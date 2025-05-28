
import React from 'react';
import { KeywordData } from "@/utils/excelUtils";
import SemrushInputForm from './semrush/SemrushInputForm';
import SemrushApiStatus from './semrush/SemrushApiStatus';
import SemrushErrorDisplay from './semrush/SemrushErrorDisplay';
import { useSemrushApi } from './semrush/useSemrushApi';

interface SemrushIntegrationProps {
  onKeywordsReceived: (keywords: KeywordData[]) => void;
  topicArea?: string;
  disabled?: boolean;
}

const SemrushIntegration: React.FC<SemrushIntegrationProps> = ({ 
  onKeywordsReceived,
  topicArea,
  disabled = false
}) => {
  const {
    keyword,
    domain,
    isLoading,
    errorMsg,
    apiStatus,
    keywordLimit,
    setKeyword,
    setDomain,
    fetchKeywords
  } = useSemrushApi(onKeywordsReceived, topicArea);

  return (
    <div className="space-y-2">
      <SemrushInputForm
        keyword={keyword}
        domain={domain}
        isLoading={isLoading}
        disabled={disabled}
        keywordLimit={keywordLimit}
        onKeywordChange={setKeyword}
        onDomainChange={setDomain}
        onFetchKeywords={fetchKeywords}
      />
      
      <SemrushApiStatus apiStatus={apiStatus} />
      <SemrushErrorDisplay errorMsg={errorMsg} />
    </div>
  );
};

export default SemrushIntegration;
