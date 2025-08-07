
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { KeywordData } from "@/utils/excelUtils";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsSection from "@/components/dashboard/StatsSection";
import ContentSection from "@/components/dashboard/ContentSection";
import RecentContent from "@/components/dashboard/RecentContent";
import SemrushCacheManager from "@/components/dashboard/SemrushCacheManager";
import { ContentStats } from "@/hooks/useContentStats";

interface DashboardTabProps {
  contentStats: ContentStats;
  selectedKeywords: string[];
  onKeywordsSelected: (keywords: string[]) => void;
  onKeywordDataUpdate: (data: KeywordData[]) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  contentStats,
  selectedKeywords,
  onKeywordsSelected,
  onKeywordDataUpdate
}) => {
  return (
    <TabsContent value="dashboard" className="m-0">
      <div className="container py-8 px-4 md:px-6 lg:px-8">
        <DashboardHeader 
          title="Office Space Content Creation"
          description="AI-powered content generation for workplace management solutions using SEMrush data and OpenAI GPT-4"
        />
        
        <StatsSection stats={contentStats} />
        
        <div className="space-y-10">
          <ContentSection
            selectedKeywords={selectedKeywords}
            onKeywordsSelected={onKeywordsSelected}
            onKeywordDataUpdate={onKeywordDataUpdate}
          />
          
          <SemrushCacheManager />
          
          <RecentContent />
        </div>
      </div>
    </TabsContent>
  );
};

export default DashboardTab;
