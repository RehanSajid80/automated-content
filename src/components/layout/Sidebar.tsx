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
import { NavLink, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Sidebar = () => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useSidebar();

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
        },
        {
          title: "Integrations",
          icon: <Settings className="h-5 w-5" />,
          href: "/integrations"
        }
      ]
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 h-screen w-[240px] bg-secondary border-r border-r-border z-10">
        <div className="p-4">
          <h1 className="text-lg font-bold">Office Space</h1>
        </div>
        <Separator />
        <nav className="py-6">
          {navigationItems.map((section, index) => (
            <div key={index} className="space-y-2">
              <div className="px-4 text-sm font-semibold text-muted-foreground">
                {section.title}
              </div>
              {section.items.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${
                      isActive ? "bg-accent text-accent-foreground font-medium" : "text-foreground"
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </NavLink>
              ))}
              <Separator className="my-2" />
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden fixed top-2 left-2 z-50"
            onClick={onOpen}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 pt-6">
          <SheetHeader className="pl-4">
            <SheetTitle>Office Space</SheetTitle>
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
                  <NavLink
                    key={item.title}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground ${
                        isActive ? "bg-accent text-accent-foreground font-medium" : "text-foreground"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </NavLink>
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
