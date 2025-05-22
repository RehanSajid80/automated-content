
import React, { useState, useCallback, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { KeywordData } from "@/utils/excelUtils";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardTab from "@/components/dashboard/DashboardTab";
import ContentManagementTab from "@/components/dashboard/ContentManagementTab";
import ContentAnalytics from "@/components/dashboard/ContentAnalytics";
import KeywordResearch from "@/components/dashboard/KeywordResearch";
import EnhancedAISuggestionsTab from "@/components/dashboard/EnhancedAISuggestionsTab";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useContentStats } from "@/hooks/useContentStats";
import { useNavigationEvents } from "@/hooks/useNavigationEvents";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [selectedTopicArea, setSelectedTopicArea] = useState<string | null>(null);
  const [contentViewMode, setContentViewMode] = useState<"selection" | "detail" | "library">("selection");
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [contentRefreshTrigger, setContentRefreshTrigger] = useState(0);

  const contentStats = useContentStats();

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === 'content') {
      setContentRefreshTrigger(prev => prev + 1);
      if (contentViewMode === "library") {
        // Keep library view when switching back to content tab
      } else {
        setContentViewMode("selection");
        setSelectedTopicArea(null);
      }
    }
  }, [contentViewMode]);

  useNavigationEvents({
    onTabChange: handleTabChange,
    setSelectedTopicArea,
    setContentViewMode,
    setSelectedContentIds
  });

  const handleKeywordsSelected = (keywords: string[]) => {
    setSelectedKeywords(keywords);
  };
  
  const handleKeywordDataUpdated = (data: KeywordData[]) => {
    setKeywordData(data);
  };

  useEffect(() => {
    // Listen for view library events from RecentContent component
    const handleViewLibrary = () => {
      handleViewLibrary();
    };
    
    window.addEventListener('view-library', handleViewLibrary);
    
    return () => {
      window.removeEventListener('view-library', handleViewLibrary);
    };
  }, []);

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <DashboardTab 
        contentStats={contentStats}
        selectedKeywords={selectedKeywords}
        onKeywordsSelected={handleKeywordsSelected}
        onKeywordDataUpdate={handleKeywordDataUpdated}
      />
      
      <TabsContent value="keywords" className="m-0">
        <div className="container py-8 px-4 md:px-6 lg:px-8">
          <DashboardHeader 
            title="Keyword Research"
            description="Explore and analyze keywords for office space management content"
          />
          
          <div className="rounded-xl border border-border bg-card p-6">
            <KeywordResearch 
              className="max-w-none" 
              onKeywordsSelected={handleKeywordsSelected}
              onKeywordDataUpdate={handleKeywordDataUpdated}
            />
          </div>
        </div>
      </TabsContent>
      
      <ContentManagementTab 
        selectedTopicArea={selectedTopicArea}
        contentViewMode={contentViewMode}
        selectedContentIds={selectedContentIds}
        selectedKeywords={selectedKeywords}
        contentRefreshTrigger={contentRefreshTrigger}
        onBack={() => setContentViewMode("selection")}
      />
      
      <TabsContent value="analytics" className="m-0">
        <div className="container py-8 px-4 md:px-6 lg:px-8">
          <DashboardHeader 
            title="Content Analytics"
            description="Track performance metrics for your office space management content"
          />
          
          <ContentAnalytics />
        </div>
      </TabsContent>
      
      <EnhancedAISuggestionsTab keywordData={keywordData} />
    </DashboardLayout>
  );
};

export default Index;
