import React, { useState } from "react";
import { Sparkles, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ContentCreatorDialog from "@/components/dashboard/ContentCreatorDialog";

interface HeaderProps {
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ className, activeTab = "dashboard", onTabChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
            src="/lovable-uploads/a610d7f5-b1ca-4f04-9892-9a2437d129a8.png" 
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
          {/* Content Creation dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Sparkles size={16} className="mr-2" />
                Create Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
                <DialogDescription>
                  Quickly generate professional content for your office space software
                </DialogDescription>
              </DialogHeader>
              <ContentCreatorDialog onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          
          {/* Mobile sheet trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="mt-6 flex flex-col space-y-2">
                <a 
                  href="#dashboard" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onTabChange) onTabChange("dashboard");
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md",
                    activeTab === "dashboard" ? "bg-secondary" : ""
                  )}
                >
                  Dashboard
                </a>
                <a 
                  href="#keywords" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onTabChange) onTabChange("keywords");
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md",
                    activeTab === "keywords" ? "bg-secondary" : ""
                  )}
                >
                  Keywords
                </a>
                <a 
                  href="#content" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onTabChange) onTabChange("content");
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md",
                    activeTab === "content" ? "bg-secondary" : ""
                  )}
                >
                  Content
                </a>
                <a 
                  href="#analytics" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (onTabChange) onTabChange("analytics");
                  }}
                  className={cn(
                    "px-3 py-2 rounded-md",
                    activeTab === "analytics" ? "bg-secondary" : ""
                  )}
                >
                  Analytics
                </a>
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      setIsDialogOpen(true);
                    }} 
                    className="w-full justify-start"
                  >
                    <Sparkles size={16} className="mr-2" />
                    Create Content
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
