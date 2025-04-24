
import React, { useState } from "react";
import { Globe, AlertTriangle, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUrlSuggestions } from "@/hooks/useUrlSuggestions";
import { ContentType } from "./types/content";

interface ContentGenerationFormProps {
  activeTab: string;
  keywords: string;
  onKeywordsChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generatingProgress: string;
  contentType: ContentType; // Updated to use the ContentType interface
}

const ContentGenerationForm: React.FC<ContentGenerationFormProps> = ({
  activeTab,
  keywords,
  onKeywordsChange,
  onGenerate,
  isGenerating,
  generatingProgress,
  contentType
}) => {
  const {
    targetUrl,
    setTargetUrl,
    urlExists,
    existingMetaTags,
    isCheckingExistence,
    handleSuggestUrl
  } = useUrlSuggestions();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        {contentType.description}
      </p>
      
      <div>
        <label htmlFor="keywords" className="text-sm font-medium mb-1.5 block">
          Target Keywords
        </label>
        <Textarea 
          id="keywords"
          placeholder="Enter keywords separated by commas"
          value={keywords}
          onChange={(e) => onKeywordsChange(e.target.value)}
          className="resize-none h-20"
        />
      </div>
      
      {activeTab === "meta" && (
        <div>
          <label htmlFor="targetUrl" className="text-sm font-medium mb-1.5 block flex items-center">
            <Globe size={16} className="mr-2" /> Target URL
          </label>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              id="targetUrl"
              placeholder="Enter target URL for meta tags"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm"
              className="whitespace-nowrap"
              onClick={() => handleSuggestUrl(keywords)}
              disabled={isCheckingExistence}
            >
              {isCheckingExistence ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>Suggest URL</>
              )}
            </Button>
          </div>
          <div className="flex items-center mt-2 text-xs">
            {!urlExists && !isCheckingExistence && (
              <div className="text-amber-500 flex items-center">
                <AlertTriangle size={14} className="mr-1" />
                <span>New page recommendation for this keyword</span>
              </div>
            )}
            {existingMetaTags && !isCheckingExistence && (
              <div className="text-blue-500 flex items-center ml-auto">
                <Tag size={14} className="mr-1" />
                <span>Meta tags already exist for this URL</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter an OfficeSpaceSoftware.com URL to generate optimized meta tags
          </p>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              {generatingProgress || "Generating..."}
            </>
          ) : (
            <>
              Generate {contentType.name}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContentGenerationForm;
