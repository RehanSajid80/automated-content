
import React, { useMemo } from "react";
import { KeywordData } from "@/utils/excelUtils";
import KeywordSuggestions from "./KeywordSuggestions";
import { analyzeKeywords } from "@/utils/contentSuggestionUtils";

interface KeywordContentSuggestionsProps {
  keywords: KeywordData[];
}

const KeywordContentSuggestions: React.FC<KeywordContentSuggestionsProps> = ({ keywords }) => {
  const suggestions = useMemo(() => {
    return analyzeKeywords(keywords);
  }, [keywords]);

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Content Suggestions</h3>
        <KeywordSuggestions suggestions={suggestions} />
      </div>
    </div>
  );
};

export default KeywordContentSuggestions;
