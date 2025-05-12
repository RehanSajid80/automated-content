
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "./LoadingState";
import { Globe, ExternalLink, Loader2 } from "lucide-react";

interface ContentGeneratorFormProps {
  activeTab: string;
  keywords: string;
  targetUrl: string;
  socialContext?: string;
  onKeywordsChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSocialContextChange: (value: string) => void;
  onGenerate: () => void;
  onSuggestUrl: () => void;
  isGenerating: boolean;
  isCheckingUrl: boolean;
  generatingProgress: string;
}

export const ContentGeneratorForm: React.FC<ContentGeneratorFormProps> = ({
  activeTab,
  keywords,
  targetUrl,
  socialContext,
  onKeywordsChange,
  onUrlChange,
  onSocialContextChange,
  onGenerate,
  onSuggestUrl,
  isGenerating,
  isCheckingUrl,
  generatingProgress,
}) => {
  if (isGenerating) {
    return <LoadingState message={generatingProgress || "Generating content..."} />;
  }

  return (
    <div className="space-y-4">
      <textarea
        value={keywords}
        onChange={(e) => onKeywordsChange(e.target.value)}
        placeholder="Enter keywords separated by commas..."
        className="w-full h-32 p-3 border rounded-md"
      />

      {activeTab === "meta" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Globe className="text-gray-500" size={16} />
            <span className="text-sm font-medium">Target URL</span>
          </div>
          <div className="flex space-x-2">
            <Input
              value={targetUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Enter target URL..."
              className="flex-1"
            />
            <Button 
              variant="outline" 
              onClick={onSuggestUrl}
              disabled={!keywords || isCheckingUrl}
              className="whitespace-nowrap"
            >
              {isCheckingUrl ? "Checking..." : "Suggest URL"}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {activeTab === "social" && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            Social Media Context
          </label>
          <Textarea
            value={socialContext}
            onChange={(e) => onSocialContextChange(e.target.value)}
            placeholder="Describe your target audience, campaign goals, brand voice, and any specific messaging points to include..."
            className="min-h-[100px]"
          />
        </div>
      )}
      
      <Button 
        onClick={onGenerate}
        disabled={!keywords.trim() || isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {generatingProgress || "Generating..."}
          </>
        ) : (
          <>Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Content</>
        )}
      </Button>
    </div>
  );
};
