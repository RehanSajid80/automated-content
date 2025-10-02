
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DesktopNavigation from "./header/DesktopNavigation";
import MobileMenu from "./header/MobileMenu";
import ContentCreatorButton from "./header/ContentCreatorButton";
import { UserMenu } from "@/components/auth/UserMenu";

interface HeaderProps {
  className?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  className, 
  activeTab = "dashboard", 
  onTabChange 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  
  // Sync the current tab with URL location
  useEffect(() => {
    // Return if we're on a different page than home
    if (location.pathname !== "/" && onTabChange) {
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    
    if (tabParam && onTabChange) {
      onTabChange(tabParam);
    }
  }, [location, onTabChange]);

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
        
        <DesktopNavigation activeTab={activeTab} onTabChange={onTabChange} />
        
        <div className="flex items-center space-x-2">
          <ContentCreatorButton className="hidden md:flex" />
          
          {user && <UserMenu user={user} />}
          
          <MobileMenu 
            activeTab={activeTab} 
            onTabChange={onTabChange} 
            onCreateContent={() => setIsDialogOpen(true)} 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
