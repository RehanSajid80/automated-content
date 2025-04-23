import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import KeywordResearch from "@/components/dashboard/KeywordResearch";
import ContentGenerator from "@/components/dashboard/ContentGenerator";
import ManualContentCreator from "@/components/dashboard/ManualContentCreator";
import RecentContent from "@/components/dashboard/RecentContent";
import ContentAnalytics from "@/components/dashboard/ContentAnalytics";
import ContentSuggestions from "@/components/dashboard/ContentSuggestions";
import { FileTextIcon, Tag, Share2, TrendingUp, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeywordData } from "@/utils/excelUtils";
import { ContentSelectionView } from "@/components/dashboard/ContentSelectionView";
import ContentDetailView from "@/components/dashboard/ContentDetailView";
import { clearCache } from "@/utils/contentLifecycleUtils";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);
  const [selectedTopicArea, setSelectedTopicArea] = useState<string | null>(null);
  const [contentViewMode, setContentViewMode] = useState<"selection" | "detail">("selection");
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [contentRefreshTrigger, setContentRefreshTrigger] = useState(0);
  const [contentStats, setContentStats] = useState({
    pillarCount: 0,
    supportCount: 0,
    metaCount: 0,
    socialCount: 0
  });

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === 'content') {
      setContentRefreshTrigger(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    const fetchContentStats = async () => {
      try {
        const { count: pillarCount } = await supabase
          .from('content_library')
          .select('id', { count: 'exact' })
          .eq('content_type', 'pillar');

        const { count: supportCount } = await supabase
          .from('content_library')
          .select('id', { count: 'exact' })
          .eq('content_type', 'support');

        const { count: metaCount } = await supabase
          .from('content_library')
          .select('id', { count: 'exact' })
          .eq('content_type', 'meta');

        const { count: socialCount } = await supabase
          .from('content_library')
          .select('id', { count: 'exact' })
          .eq('content_type', 'social');

        setContentStats({
          pillarCount: pillarCount || 0,
          supportCount: supportCount || 0,
          metaCount: metaCount || 0,
          socialCount: socialCount || 0
        });
      } catch (error) {
        console.error('Error fetching content stats:', error);
      }
    };

    fetchContentStats();
  }, []);

  useEffect(() => {
    const handleNavigateToContent = (event: CustomEvent<{ topicArea: string }>) => {
      setActiveTab('content');
      setSelectedTopicArea(event.detail.topicArea);
      setContentViewMode("selection");
      
      clearCache(`content_${event.detail.topicArea.toLowerCase().replace(/\s+/g, '_')}`);
    };
    
    const handleNavigateToTab = (event: CustomEvent<{ tab: string }>) => {
      handleTabChange(event.detail.tab);
      if (event.detail.tab === 'dashboard') {
        setSelectedTopicArea(null);
      }
    };

    const handleNavigateToContentDetails = (event: CustomEvent<{ contentIds: string[], topicArea: string }>) => {
      setActiveTab('content');
      setContentViewMode("detail");
      setSelectedContentIds(event.detail.contentIds);
      setSelectedTopicArea(event.detail.topicArea);
      
      clearCache(`content_detail_${event.detail.contentIds.sort().join('_')}`);
    };

    const handleContentUpdated = () => {
      setContentRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('navigate-to-content', handleNavigateToContent as EventListener);
    window.addEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
    window.addEventListener('navigate-to-content-details', handleNavigateToContentDetails as EventListener);
    window.addEventListener('content-updated', handleContentUpdated as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-content', handleNavigateToContent as EventListener);
      window.removeEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
      window.removeEventListener('navigate-to-content-details', handleNavigateToContentDetails as EventListener);
      window.removeEventListener('content-updated', handleContentUpdated as EventListener);
    };
  }, [handleTabChange]);

  const handleKeywordsSelected = (keywords: string[]) => {
    setSelectedKeywords(keywords);
  };
  
  const handleKeywordDataUpdated = (data: KeywordData[]) => {
    setKeywordData(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="pt-[72px] md:pl-[240px] min-h-screen">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="dashboard" className="m-0">
            <div className="container py-8 px-4 md:px-6 lg:px-8">
              <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tight">Office Space Content Creation</h1>
                <p className="text-muted-foreground mt-1">
                  AI-powered content generation for workplace management solutions using SEMrush data and OpenAI GPT-4
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                  title="Pillar Content"
                  value={contentStats.pillarCount.toString()}
                  icon={<FileTextIcon size={20} />}
                  trend={contentStats.pillarCount > 0 ? "up" : "neutral"}
                  trendValue={contentStats.pillarCount > 0 ? "New content" : "No content"}
                  delay="animation-delay-100"
                />
                <StatsCard
                  title="Support Pages"
                  value={contentStats.supportCount.toString()}
                  icon={<Building2 size={20} />}
                  trend={contentStats.supportCount > 0 ? "up" : "neutral"}
                  trendValue={contentStats.supportCount > 0 ? "New content" : "No content"}
                  delay="animation-delay-200"
                />
                <StatsCard
                  title="Meta Tags"
                  value={contentStats.metaCount.toString()}
                  icon={<Tag size={20} />}
                  trend={contentStats.metaCount > 0 ? "up" : "neutral"}
                  trendValue={contentStats.metaCount > 0 ? "New content" : "No content"}
                  delay="animation-delay-300"
                />
                <StatsCard
                  title="Social Posts"
                  value={contentStats.socialCount.toString()}
                  icon={<Share2 size={20} />}
                  trend={contentStats.socialCount > 0 ? "up" : "neutral"}
                  trendValue={contentStats.socialCount > 0 ? "New content" : "No content"}
                  delay="animation-delay-400"
                />
              </div>
              
              <div className="space-y-10">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex flex-col space-y-6">
                    <div className="flex flex-col space-y-2">
                      <h3 className="text-xl font-semibold">Keyword Selection & Content Generation</h3>
                      <p className="text-muted-foreground">
                        Select keywords from your SEMrush data to generate optimized content
                      </p>
                    </div>

                    <KeywordResearch 
                      onKeywordsSelected={handleKeywordsSelected} 
                      onKeywordDataUpdate={handleKeywordDataUpdated}
                    />

                    {selectedKeywords.length > 0 && (
                      <div className="pt-6 border-t border-border">
                        <ContentGenerator keywords={selectedKeywords} />
                      </div>
                    )}
                  </div>
                </div>
                
                <ManualContentCreator />
                
                <RecentContent />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="keywords" className="m-0">
            <div className="container py-8 px-4 md:px-6 lg:px-8">
              <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tight">Keyword Research</h1>
                <p className="text-muted-foreground mt-1">
                  Explore and analyze keywords for office space management content
                </p>
              </div>
              
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
              <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tight">Content Creation</h1>
                <p className="text-muted-foreground mt-1">
                  Generate and manage content for your office space management platform
                </p>
              </div>
              
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
              <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tight">Content Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  Track performance metrics for your office space management content
                </p>
              </div>
              
              <ContentAnalytics />
            </div>
          </TabsContent>
          
          <TabsContent value="ai-suggestions" className="m-0">
            <div className="container py-8 px-4 md:px-6 lg:px-8">
              <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tight">AI Content Suggestions</h1>
                <p className="text-muted-foreground mt-1">
                  Use OpenAI to analyze your keyword data and suggest content topic areas
                </p>
              </div>
              
              <div className="rounded-xl border border-border bg-card p-6">
                <ContentSuggestions 
                  keywords={keywordData} 
                  className="max-w-none" 
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
