
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
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p>Welcome to your content management dashboard</p>
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
