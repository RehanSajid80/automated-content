
import React from "react";
import { Sparkles, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
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
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-3 py-2"
          >
            Dashboard
          </a>
          <a 
            href="#keywords" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-3 py-2"
          >
            Keywords
          </a>
          <a 
            href="#content" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-3 py-2"
          >
            Content
          </a>
          <a 
            href="#analytics" 
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors px-3 py-2"
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
