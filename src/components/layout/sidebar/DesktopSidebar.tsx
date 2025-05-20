
import React from "react";
import { Separator } from "@/components/ui/separator";
import { navigationItems, useSidebarNavigation } from "./SidebarNavItems";

const DesktopSidebar = () => {
  const { isActive, handleNavigation } = useSidebarNavigation();

  return (
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
  );
};

export default DesktopSidebar;
