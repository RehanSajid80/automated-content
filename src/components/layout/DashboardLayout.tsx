
import React from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Tabs } from "@/components/ui/tabs";

interface DashboardLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={onTabChange} />
      <Sidebar />
      
      <main className="pt-[72px] md:pl-[240px] min-h-screen">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          {children}
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardLayout;
