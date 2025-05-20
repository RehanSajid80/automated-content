
import React from "react";
import {
  LayoutDashboard,
  Settings,
  Braces,
  Tag,
  FileText,
  Share2,
  TrendingUp,
  BrainCircuit,
  Library
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const navigationItems: NavigationSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: "/"
      }
    ]
  },
  {
    title: "Content",
    items: [
      {
        title: "Content",
        icon: <FileText className="h-5 w-5" />,
        href: "/?tab=content"
      },
      {
        title: "Content Library",
        icon: <Library className="h-5 w-5" />,
        href: "/library"
      },
      {
        title: "Keywords",
        icon: <Tag className="h-5 w-5" />,
        href: "/?tab=keywords"
      },
      {
        title: "Analytics",
        icon: <TrendingUp className="h-5 w-5" />,
        href: "/?tab=analytics"
      },
      {
        title: "AI Suggestions",
        icon: <BrainCircuit className="h-5 w-5" />,
        href: "/?tab=ai-suggestions"
      }
    ]
  },
  {
    title: "Social Media",
    items: [
      {
        title: "Social Posts",
        icon: <Share2 className="h-5 w-5" />,
        href: "#"
      }
    ]
  },
  {
    title: "Settings",
    items: [
      {
        title: "API Connections",
        icon: <Braces className="h-5 w-5" />,
        href: "/api-connections"
      }
    ]
  },
];

export const useSidebarNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Helper function to determine if a nav item is active
  const isActive = (href: string) => {
    if (href === "/") {
      // Only consider exact match for homepage without params
      return location.pathname === "/" && !location.search;
    }
    
    // For tab links, check if the tab parameter matches
    if (href.includes("?tab=")) {
      const tabParam = new URLSearchParams(href.split("?")[1]).get("tab");
      const currentTabParam = new URLSearchParams(location.search).get("tab");
      
      return tabParam === currentTabParam;
    }
    
    // Default case for other routes
    return location.pathname === href;
  };

  // Handle navigation with proper event dispatching
  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    // Extract the tab parameter if it exists
    if (href.includes("?tab=")) {
      const tabParam = new URLSearchParams(href.split("?")[1]).get("tab");
      
      if (tabParam) {
        // Navigate and dispatch event for tab changes
        navigate(`/?tab=${tabParam}`);
        
        // Dispatch navigation event for the tab system
        window.dispatchEvent(new CustomEvent('navigate-to-tab', { 
          detail: { tab: tabParam } 
        }));
        
        return;
      }
    }
    
    // For non-tab navigation or no tab parameter
    navigate(href);
  };
  
  return { isActive, handleNavigation };
};
