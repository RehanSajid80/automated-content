
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { KeywordData } from "@/utils/excelUtils";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContentSuggestions from "@/components/dashboard/ContentSuggestions";

interface AISuggestionsTabProps {
  keywordData: KeywordData[];
}

const AISuggestionsTab: React.FC<AISuggestionsTabProps> = ({ keywordData }) => {
  return (
    <TabsContent value="ai-suggestions" className="m-0">
      <div className="container py-8 px-4 md:px-6 lg:px-8 w-full max-w-full">
        <DashboardHeader 
          title="AI Content Suggestions"
          description="Use OpenAI to analyze your keyword data and suggest content topic areas"
        />
        
        <div className="rounded-xl border border-border bg-card p-6 w-full max-w-full">
          <ContentSuggestions 
            keywords={keywordData}
            className="max-w-full w-full"
          />
        </div>
      </div>
    </TabsContent>
  );
};

export default AISuggestionsTab;
