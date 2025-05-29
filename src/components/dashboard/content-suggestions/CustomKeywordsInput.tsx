
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomKeywordsInputProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  disabled?: boolean;
}

export const CustomKeywordsInput: React.FC<CustomKeywordsInputProps> = ({
  keywords,
  onKeywordsChange,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState("");

  const addKeyword = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !keywords.includes(trimmedValue)) {
      onKeywordsChange([...keywords, trimmedValue]);
      setInputValue("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    onKeywordsChange(keywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="space-y-2">
      <Label>📝 Custom Keywords</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add keywords like hybrid work, office usage..."
          disabled={disabled}
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={addKeyword} 
          disabled={!inputValue.trim() || disabled}
          size="sm"
        >
          Add
        </Button>
      </div>
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {keyword}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeKeyword(keyword)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
