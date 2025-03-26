
import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-6 py-4 glassmorphism animate-fade-in",
        className
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <Sparkles size={20} />
          </div>
          <div className="font-medium text-lg tracking-tight">Automated Content Creation</div>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a 
            href="#dashboard" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </a>
          <a 
            href="#keywords" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Keywords
          </a>
          <a 
            href="#content" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Content
          </a>
          <a 
            href="#analytics" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Analytics
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <button className="text-sm font-medium rounded-full px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            New Project
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
