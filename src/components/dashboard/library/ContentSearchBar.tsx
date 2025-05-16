
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ContentSearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ContentSearchBar: React.FC<ContentSearchBarProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Search content..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-9"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          onClick={() => setSearchTerm("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default ContentSearchBar;
