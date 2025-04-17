
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import KeywordResearch from "@/components/dashboard/KeywordResearch";
import ContentGenerator from "@/components/dashboard/ContentGenerator";
import ContentAnalytics from "@/components/dashboard/ContentAnalytics";
import ApiConnectionsManager from "@/components/settings/ApiConnectionsManager";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pt-[72px] md:pl-[240px] transition-all duration-300">
        <div className="container p-4 md:p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Office Space Content Creation</h1>
                <p className="text-lg text-muted-foreground">
                  AI-powered content generation for workplace management solutions using SEMrush data and OpenAI GPT-4
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-card shadow-sm">
                  <h3 className="text-lg font-medium mb-2">Keyword Research</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Analyze SEMrush data to find high-impact keywords for office space management
                  </p>
                  <button 
                    className="text-sm text-primary font-medium"
                    onClick={() => setActiveTab("keywords")}
                  >
                    Go to Keyword Research →
                  </button>
                </div>
                
                <div className="p-6 border rounded-lg bg-card shadow-sm">
                  <h3 className="text-lg font-medium mb-2">Content Generator</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create optimized content for blog posts, landing pages, and more
                  </p>
                  <button 
                    className="text-sm text-primary font-medium"
                    onClick={() => setActiveTab("content")}
                  >
                    Go to Content Generator →
                  </button>
                </div>
                
                <div className="p-6 border rounded-lg bg-card shadow-sm">
                  <h3 className="text-lg font-medium mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Monitor content performance and get insights for improvement
                  </p>
                  <button 
                    className="text-sm text-primary font-medium"
                    onClick={() => setActiveTab("analytics")}
                  >
                    Go to Analytics →
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "keywords" && <KeywordResearch />}
          
          {activeTab === "content" && <ContentGenerator />}
          
          {activeTab === "analytics" && <ContentAnalytics />}
          
          {activeTab === "apiConnections" && <ApiConnectionsManager />}
        </div>
      </main>
    </div>
  );
};

export default Index;
