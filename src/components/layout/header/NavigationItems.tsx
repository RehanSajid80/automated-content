
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface NavigationItemProps {
  href: string;
  onClick: (e: React.MouseEvent) => void;
  isActive: boolean;
  children: React.ReactNode;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ 
  href, 
  onClick, 
  isActive, 
  children 
}) => {
  return (
    <a 
      href={href} 
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors px-3 py-2 rounded-md",
        isActive
          ? "bg-secondary/80 text-foreground" 
          : "text-foreground/80 hover:text-primary hover:bg-secondary/50"
      )}
    >
      {children}
    </a>
  );
};

export const useNavigation = (activeTab: string, onTabChange?: (tab: string) => void) => {
  const navigate = useNavigate();
  
  const handleTabClick = (tab: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Special case for Content Library tab - navigate to the library page
    if (tab === "library") {
      navigate("/library");
      return;
    }
    
    // For other tabs, navigate to the home page with the tab parameter
    if (onTabChange) {
      navigate(`/?tab=${tab}`);
      onTabChange(tab);
    }
  };
  
  return { handleTabClick };
};
