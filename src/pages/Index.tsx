import React, { useState } from "react";
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

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordData, setKeywordData] = useState<KeywordData[]>([]);

  const handleKeywordsSelected = (keywords: string[]) => {
    setSelectedKeywords(keywords);
  };
  
  const handleKeywordDataUpdated = (data: KeywordData[]) => {
    setKeywordData(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-[72px] md:pl-[240px] min-h-screen">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  value="8"
                  icon={<FileTextIcon size={20} />}
                  trend="up"
                  trendValue="3 new this week"
                  delay="animation-delay-100"
                />
                <StatsCard
                  title="Support Pages"
                  value="22"
                  icon={<Building2 size={20} />}
                  trend="up"
                  trendValue="5 new this week"
                  delay="animation-delay-200"
                />
                <StatsCard
                  title="Meta Tags"
                  value="46"
                  icon={<Tag size={20} />}
                  trend="neutral"
                  trendValue="Same as last week"
                  delay="animation-delay-300"
                />
                <StatsCard
                  title="Social Posts"
                  value="94"
                  icon={<Share2 size={20} />}
                  trend="up"
                  trendValue="18 new this week"
                  delay="animation-delay-400"
                />
              </div>
              
              <div className="space-y-10">
                <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-300">
                  <h3 className="text-xl font-semibold mb-6">Office Space SEO Keywords</h3>
                  <KeywordResearch 
                    onKeywordsSelected={handleKeywordsSelected} 
                    onKeywordDataUpdate={handleKeywordDataUpdated}
                  />
                </div>
                
                <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-400">
                  <h3 className="text-xl font-semibold mb-6">AI Content Generator</h3>
                  <ContentGenerator keywords={selectedKeywords} />
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
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Content Generator</h3>
                  <ContentGenerator className="max-w-none" keywords={selectedKeywords} />
                </div>
                
                <ManualContentCreator />
                <RecentContent />
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
