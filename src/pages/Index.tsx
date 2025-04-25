import React, { useState, useCallback, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ManualContentCreator from "@/components/dashboard/ManualContentCreator";
import RecentContent from "@/components/dashboard/RecentContent";
import ContentAnalytics from "@/components/dashboard/ContentAnalytics";
import ContentSuggestions from "@/components/dashboard/ContentSuggestions";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { KeywordData } from "@/utils/excelUtils";
import { ContentSelectionView } from "@/components/dashboard/ContentSelectionView";
import ContentDetailView from "@/components/dashboard/ContentDetailView";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsSection from "@/components/dashboard/StatsSection";
import ContentSection from "@/components/dashboard/ContentSection";
import { useContentStats } from "@/hooks/useContentStats";
import { useNavigationEvents } from "@/hooks/useNavigationEvents";
import KeywordResearch from "@/components/dashboard/KeywordResearch";
import ContentGenerator from "@/components/dashboard/ContentGenerator";
import ContentLibrary from "@/components/dashboard/ContentLibrary";

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

  const handleViewLibrary = () => {
    setContentViewMode("library");
    if (activeTab !== "content") {
      setActiveTab("content");
    }
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
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <Sidebar />
      
      <main className="pt-[72px] md:pl-[240px] min-h-screen">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
                  onKeywordsSelected={handleKeywordsSelected}
                  onKeywordDataUpdate={handleKeywordDataUpdated}
                />
                
                <ManualContentCreator />
                
                <RecentContent />
              </div>
            </div>
          </TabsContent>
          
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
          
          <TabsContent value="content" className="m-0">
            <div className="container py-8 px-4 md:px-6 lg:px-8">
              <DashboardHeader 
                title="Content Creation"
                description="Generate and manage content for your office space management platform"
              />
              
              <div className="space-y-8">
                {selectedTopicArea ? (
                  <div className="rounded-xl border border-border bg-card p-6">
                    {contentViewMode === "selection" ? (
                      <ContentSelectionView topicArea={selectedTopicArea} key={`selection-${selectedTopicArea}-${contentRefreshTrigger}`} />
                    ) : (
                      <ContentDetailView 
                        contentIds={selectedContentIds} 
                        topicArea={selectedTopicArea}
                        onBack={() => setContentViewMode("selection")}
                        key={`detail-${selectedContentIds.join('-')}-${contentRefreshTrigger}`}
                      />
                    )}
                  </div>
                ) : contentViewMode === "library" ? (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <ContentLibrary key={`library-${contentRefreshTrigger}`} />
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="text-lg font-semibold mb-4">Content Generator</h3>
                      <ContentGenerator className="max-w-none" keywords={selectedKeywords} />
                    </div>
                    <ManualContentCreator />
                    <RecentContent key={`recent-${contentRefreshTrigger}`} />
                  </>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="m-0">
            <div className="container py-8 px-4 md:px-6 lg:px-8">
              <DashboardHeader 
                title="Content Analytics"
                description="Track performance metrics for your office space management content"
              />
              
              <ContentAnalytics />
            </div>
          </TabsContent>
          
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
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
