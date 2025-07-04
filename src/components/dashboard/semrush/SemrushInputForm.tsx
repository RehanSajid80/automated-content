
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
    <div className="space-y-3">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter keyword (optional, e.g., asset management)"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          disabled={disabled || isLoading}
        />
        
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter domain (optional, e.g., officespacesoftware.com)"
            value={domain}
            onChange={(e) => onDomainChange(e.target.value)}
            disabled={disabled || isLoading}
            className="flex-1"
          />
          
          <Button 
            onClick={onFetchKeywords} 
            disabled={isLoading || disabled}
            className="shrink-0"
            title={keyword.trim() 
              ? `Will fetch ${keywordLimit} keywords related to "${keyword}"`
              : `Will fetch ${keywordLimit} keywords for general research`
            }
          >
            {isLoading ? (
              <>
                <Database className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Keywords ({keywordLimit})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SemrushInputForm;
