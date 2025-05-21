
import React from "react";
import { NavigationItem, useNavigation } from "./NavigationItems";

interface DesktopNavigationProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ activeTab, onTabChange }) => {
  const { handleTabClick } = useNavigation(activeTab, onTabChange);

  return (
    <nav className="hidden md:flex space-x-4">
      <NavigationItem 
        href="#dashboard" 
        onClick={handleTabClick("dashboard")}
        isActive={activeTab === "dashboard"}
      >
        Dashboard
      </NavigationItem>
      <NavigationItem
        href="#keywords" 
        onClick={handleTabClick("keywords")}
        isActive={activeTab === "keywords"}
      >
        Keywords
      </NavigationItem>
      <NavigationItem
        href="#content" 
        onClick={handleTabClick("content")}
        isActive={activeTab === "content"}
      >
        Content
      </NavigationItem>
      <NavigationItem
        href="#analytics" 
        onClick={handleTabClick("analytics")}
        isActive={activeTab === "analytics"}
      >
        Analytics
      </NavigationItem>
      <NavigationItem
        href="#library" 
        onClick={handleTabClick("library")}
        isActive={activeTab === "library"}
      >
        Content Library
      </NavigationItem>
    </nav>
  );
};

export default DesktopNavigation;
