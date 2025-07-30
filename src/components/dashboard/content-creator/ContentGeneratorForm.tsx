
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LoadingState } from "./LoadingState";
import { Globe, ExternalLink, Loader2, Brain } from "lucide-react";

interface ContentGeneratorFormProps {
  activeTab: string;
  keywords: string;
  targetUrl: string;
  socialContext?: string;
  useRAG: boolean;
  onKeywordsChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSocialContextChange: (value: string) => void;
  onRAGToggle: (value: boolean) => void;
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
  useRAG,
  onKeywordsChange,
  onUrlChange,
  onSocialContextChange,
  onRAGToggle,
  onGenerate,
  onSuggestUrl,
  isGenerating,
  isCheckingUrl,
  generatingProgress,
}) => {
  if (isGenerating) {
    return <LoadingState message={generatingProgress || "Generating content via webhook..."} />;
  }

  return (
    <div className="space-y-4">
      <textarea
        value={keywords}
        onChange={(e) => onKeywordsChange(e.target.value)}
        placeholder="Enter keywords separated by commas..."
        className="w-full h-32 p-3 border rounded-md"
      />

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Globe className="text-gray-500" size={16} />
          <span className="text-sm font-medium">Target URL {activeTab === "meta" ? "(Required for Meta Tags)" : "(Optional)"}</span>
        </div>
        <div className="flex space-x-2">
          <Input
            value={targetUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={activeTab === "social" ? "URL of article/page to reference (e.g., blog post URL)" : "Enter target URL..."}
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="text-blue-500" size={16} />
            <span className="text-sm font-medium">Use RAG (Style Learning)</span>
          </div>
          <Switch
            checked={useRAG}
            onCheckedChange={onRAGToggle}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Use your existing content library to learn style patterns and maintain consistency
        </p>
      </div>
      
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
