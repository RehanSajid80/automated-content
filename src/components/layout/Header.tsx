
import React from "react";
import { Sparkles, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ className, activeTab = "dashboard", onTabChange }) => {
  const handleTabClick = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-3 glassmorphism animate-fade-in border-b border-border/50",
        className
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img 
            src="https://cdn-ilblgal.nitrocdn.com/LtOfWpqsvRVXueIPEGVTBaxpvBAGgdOw/assets/images/optimized/rev-8c34eb7/www.officespacesoftware.com/wp-content/uploads/oss-logo-top-nav-v1.png" 
            alt="Office Space Software Logo" 
            className="h-8"
          />
          <div className="font-medium text-lg tracking-tight hidden md:block">Automated Content Creation</div>
        </div>
        <nav className="hidden md:flex space-x-4">
          <a 
            href="#dashboard" 
            onClick={handleTabClick("dashboard")}
            className={cn(
              "text-sm font-medium transition-colors px-3 py-2 rounded-md",
              activeTab === "dashboard" 
                ? "bg-secondary/80 text-foreground" 
                : "text-foreground/80 hover:text-primary hover:bg-secondary/50"
            )}
          >
            Dashboard
          </a>
          <a 
            href="#keywords" 
            onClick={handleTabClick("keywords")}
            className={cn(
              "text-sm font-medium transition-colors px-3 py-2 rounded-md",
              activeTab === "keywords" 
                ? "bg-secondary/80 text-foreground" 
                : "text-foreground/80 hover:text-primary hover:bg-secondary/50"
            )}
          >
            Keywords
          </a>
          <a 
            href="#content" 
            onClick={handleTabClick("content")}
            className={cn(
              "text-sm font-medium transition-colors px-3 py-2 rounded-md",
              activeTab === "content" 
                ? "bg-secondary/80 text-foreground" 
                : "text-foreground/80 hover:text-primary hover:bg-secondary/50"
            )}
          >
            Content
          </a>
          <a 
            href="#analytics" 
            onClick={handleTabClick("analytics")}
            className={cn(
              "text-sm font-medium transition-colors px-3 py-2 rounded-md",
              activeTab === "analytics" 
                ? "bg-secondary/80 text-foreground" 
                : "text-foreground/80 hover:text-primary hover:bg-secondary/50"
            )}
          >
            Analytics
          </a>
        </nav>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Sparkles size={16} className="mr-2" />
            Create Content
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
