
import React from "react";
import { Menu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface MobileMenuProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  onCreateContent: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  activeTab, 
  onTabChange,
  onCreateContent
}) => {
  const navigate = useNavigate();

  const handleNavigation = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (tab === "library") {
      navigate("/library");
      return;
    }
    
    navigate(`/?tab=${tab}`);
    if (onTabChange) onTabChange(tab);
  };

  return (
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
            onClick={handleNavigation("dashboard")}
            className={cn(
              "px-3 py-2 rounded-md",
              activeTab === "dashboard" ? "bg-secondary" : ""
            )}
          >
            Dashboard
          </a>
          <a 
            href="#keywords" 
            onClick={handleNavigation("keywords")}
            className={cn(
              "px-3 py-2 rounded-md",
              activeTab === "keywords" ? "bg-secondary" : ""
            )}
          >
            Keywords
          </a>
          <a 
            href="#library" 
            onClick={handleNavigation("library")}
            className={cn(
              "px-3 py-2 rounded-md",
              activeTab === "library" ? "bg-secondary" : ""
            )}
          >
            Content Library
          </a>
          <a 
            href="#content" 
            onClick={handleNavigation("content")}
            className={cn(
              "px-3 py-2 rounded-md",
              activeTab === "content" ? "bg-secondary" : ""
            )}
          >
            Content
          </a>
          <a 
            href="#analytics" 
            onClick={handleNavigation("analytics")}
            className={cn(
              "px-3 py-2 rounded-md",
              activeTab === "analytics" ? "bg-secondary" : ""
            )}
          >
            Analytics
          </a>
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={onCreateContent} 
              className="w-full justify-start"
            >
              <Sparkles size={16} className="mr-2" />
              Create Content
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
