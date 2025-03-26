import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import KeywordResearch from "@/components/dashboard/KeywordResearch";
import ContentGenerator from "@/components/dashboard/ContentGenerator";
import ManualContentCreator from "@/components/dashboard/ManualContentCreator";
import RecentContent from "@/components/dashboard/RecentContent";
import ContentAnalytics from "@/components/dashboard/ContentAnalytics";
import N8nIntegration from "@/components/integrations/N8nIntegration";
import { FileTextIcon, Tag, Share2, TrendingUp, Building2, BarChart, Server } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <KeywordResearch />
                <ContentGenerator />
              </div>
              
              <ManualContentCreator className="mb-6" />
              
              <RecentContent className="mb-8" />
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
              
              <div className="grid grid-cols-1 gap-6">
                <KeywordResearch className="max-w-none" />
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
              
              <div className="grid grid-cols-1 gap-6 mb-6">
                <ContentGenerator className="max-w-none" />
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
          
          <TabsContent value="n8n" className="m-0">
            <div className="container py-8 px-4 md:px-6 lg:px-8">
              <div className="mb-8 animate-slide-up">
                <h1 className="text-3xl font-bold tracking-tight">n8n Integration</h1>
                <p className="text-muted-foreground mt-1">
                  Connect your content generation system to n8n.io for workflow automation
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <N8nIntegration />
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-4">How n8n Integration Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-2">1</div>
                        <h4 className="font-medium">Content Creation</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        When content is created in your system, trigger a workflow in n8n
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 flex items-center justify-center mr-2">2</div>
                        <h4 className="font-medium">n8n Workflow</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Process the content through n8n workflows, add metadata, categorize, and enhance
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center mr-2">3</div>
                        <h4 className="font-medium">Distribution</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Automatically publish to your website, CMS, social media, or send via email
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
