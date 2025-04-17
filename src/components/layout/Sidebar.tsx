
import React from "react";
import { 
  HomeIcon, 
  SearchIcon, 
  FileTextIcon, 
  TagIcon, 
  ShareIcon, 
  SettingsIcon, 
  HelpCircleIcon,
  BarChart,
  KeyIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, activeTab = "dashboard", onTabChange }) => {
  const handleTabClick = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <aside 
      className={cn(
        "fixed top-[72px] left-0 h-[calc(100vh-72px)] w-[240px] bg-secondary/50 backdrop-blur-md border-r border-border p-4",
        "hidden md:block animate-slide-up animation-delay-200",
        className
      )}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="text-xs uppercase font-semibold tracking-wider text-muted-foreground px-2 py-1">
            Main
          </div>
          <nav className="space-y-1">
            <a 
              href="#" 
              onClick={handleTabClick("dashboard")}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
                activeTab === "dashboard" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              )}
            >
              <HomeIcon size={16} />
              <span>Dashboard</span>
            </a>
            <a 
              href="#" 
              onClick={handleTabClick("keywords")}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
                activeTab === "keywords" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              )}
            >
              <SearchIcon size={16} />
              <span>Keyword Research</span>
            </a>
            <a 
              href="#" 
              onClick={handleTabClick("content")}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
                activeTab === "content" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              )}
            >
              <FileTextIcon size={16} />
              <span>Content Library</span>
            </a>
            <a 
              href="#" 
              onClick={handleTabClick("analytics")}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
                activeTab === "analytics" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              )}
            >
              <BarChart size={16} />
              <span>Analytics</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <TagIcon size={16} />
              <span>Meta Tags</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ShareIcon size={16} />
              <span>Social Posts</span>
            </a>
          </nav>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs uppercase font-semibold tracking-wider text-muted-foreground px-2 py-1">
            Settings
          </div>
          <nav className="space-y-1">
            <a 
              href="#" 
              onClick={handleTabClick("apiConnections")}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
                activeTab === "apiConnections" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              )}
            >
              <KeyIcon size={16} />
              <span>API Connections</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <HelpCircleIcon size={16} />
              <span>Help & Support</span>
            </a>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
