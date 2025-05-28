
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Database } from "lucide-react";

interface SemrushInputFormProps {
  keyword: string;
  domain: string;
  isLoading: boolean;
  disabled: boolean;
  keywordLimit: number;
  onKeywordChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onFetchKeywords: () => void;
}

const SemrushInputForm: React.FC<SemrushInputFormProps> = ({
  keyword,
  domain,
  isLoading,
  disabled,
  keywordLimit,
  onKeywordChange,
  onDomainChange,
  onFetchKeywords
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Input
        type="text"
        placeholder="Enter keyword (e.g., asset management)"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        className="max-w-sm"
        disabled={disabled}
      />
      <div className="flex gap-2 items-center">
        <Input
          type="text"
          placeholder="Enter domain (e.g., officespacesoftware.com)"
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          className="max-w-sm"
          disabled={disabled}
        />
        <Button 
          onClick={onFetchKeywords} 
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
  );
};

export default SemrushInputForm;
