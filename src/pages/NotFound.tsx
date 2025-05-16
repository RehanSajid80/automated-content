
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4 animate-fade-in">
        <img 
          src="/lovable-uploads/6ce6457f-d6fd-47cc-80e4-909e169bac18.png" 
          alt="Office Space Logo" 
          className="h-12 mx-auto mb-6"
        />
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl font-medium mb-6">This page doesn't exist</p>
        <p className="text-muted-foreground mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild>
          <a href="/" className="inline-flex items-center">
            <ArrowLeft size={16} className="mr-2" />
            Return to Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
