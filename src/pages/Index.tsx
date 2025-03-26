
import React from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatsCard from "@/components/dashboard/StatsCard";
import KeywordResearch from "@/components/dashboard/KeywordResearch";
import ContentGenerator from "@/components/dashboard/ContentGenerator";
import RecentContent from "@/components/dashboard/RecentContent";
import { FileTextIcon, Tag, Share2, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="pt-[72px] md:pl-[240px] min-h-screen">
        <div className="container py-8 px-4 md:px-6 lg:px-8">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold tracking-tight">Automated Content Creation</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered content generation using SEMrush data and OpenAI GPT-4
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Pillar Content"
              value="12"
              icon={<FileTextIcon size={20} />}
              trend="up"
              trendValue="4 new this week"
              delay="animation-delay-100"
            />
            <StatsCard
              title="Support Pages"
              value="28"
              icon={<FileTextIcon size={20} />}
              trend="up"
              trendValue="7 new this week"
              delay="animation-delay-200"
            />
            <StatsCard
              title="Meta Tags"
              value="64"
              icon={<Tag size={20} />}
              trend="neutral"
              trendValue="Same as last week"
              delay="animation-delay-300"
            />
            <StatsCard
              title="Social Posts"
              value="122"
              icon={<Share2 size={20} />}
              trend="up"
              trendValue="32 new this week"
              delay="animation-delay-400"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <KeywordResearch />
            <ContentGenerator />
          </div>
          
          <RecentContent className="mb-8" />
        </div>
      </main>
    </div>
  );
};

export default Index;
