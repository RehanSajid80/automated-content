
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { navigationItems, useSidebarNavigation } from "./SidebarNavItems";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`flex flex-col items-start justify-start ${className}`} {...props}>
    </div>
  );
};

const MobileSidebar = () => {
  const { openMobile, setOpenMobile } = useSidebar();
  const { isActive, handleNavigation } = useSidebarNavigation();

  // Handle mobile navigation with sidebar closing
  const handleMobileNavigation = (href: string, e: React.MouseEvent) => {
    handleNavigation(href, e);
    setOpenMobile(false);
  };

  return (
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
                  onClick={(e) => handleMobileNavigation(item.href, e)}
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
  );
};

export default MobileSidebar;
