import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Menu,
  Settings,
  Braces,
  Tag,
  FileText,
  Share2,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, openMobile, setOpenMobile } = useSidebar();

  const navigationItems = [
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
        // Close mobile sidebar if open
        if (openMobile) {
          setOpenMobile(false);
        }
        
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
    
    // Close mobile sidebar if open
    if (openMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 h-screen w-[240px] bg-secondary border-r border-r-border z-10">
        <div className="p-4">
          <img 
            src="/lovable-uploads/a610d7f5-b1ca-4f04-9892-9a2437d129a8.png" 
            alt="Office Space Logo" 
            className="h-8 mb-1" 
          />
        </div>
        <Separator />
        <nav className="py-6">
          {navigationItems.map((section, index) => (
            <div key={index} className="space-y-2">
              <div className="px-4 text-sm font-semibold text-muted-foreground">
                {section.title}
              </div>
              {section.items.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={(e) => handleNavigation(item.href, e)}
                  className={
                    isActive(item.href)
                      ? "flex items-center px-4 py-2.5 text-sm rounded-md bg-accent text-accent-foreground font-medium"
                      : "flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-foreground"
                  }
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </a>
              ))}
              <Separator className="my-2" />
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-2 left-2 z-50"
            onClick={() => setOpenMobile(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 pt-6">
          <SheetHeader className="pl-4">
            <img 
              src="/lovable-uploads/a610d7f5-b1ca-4f04-9892-9a2437d129a8.png" 
              alt="Office Space Logo" 
              className="h-8 mb-1 ml-4" 
            />
            <SheetDescription>
              Navigate through the application
            </SheetDescription>
          </SheetHeader>
          <Separator />
          <nav className="py-6">
            {navigationItems.map((section, index) => (
              <div key={index} className="space-y-2">
                <div className="px-4 text-sm font-semibold text-muted-foreground">
                  {section.title}
                </div>
                {section.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={
                      isActive(item.href)
                        ? "flex items-center px-4 py-2.5 text-sm rounded-md bg-accent text-accent-foreground font-medium"
                        : "flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-foreground"
                    }
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </a>
                ))}
                <Separator className="my-2" />
              </div>
            ))}
          </nav>
          <SheetFooter>
            <div className="p-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <p className="mt-2 text-sm">
                Signed in as <span className="font-bold">shadcn</span>
              </p>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`flex flex-col items-start justify-start ${className}`} {...props}>
    </div>
  );
};
