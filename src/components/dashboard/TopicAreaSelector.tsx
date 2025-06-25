
import React from "react";
import { Input } from "@/components/ui/input";

interface TopicAreaSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TopicAreaSelector: React.FC<TopicAreaSelectorProps> = ({
  value,
  onChange,
  disabled
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="topic-area" className="text-sm font-medium">
        Topic Area <span className="text-red-500">*</span>
      </label>
      <Input
        id="topic-area"
        type="text"
        placeholder="Enter topic area (e.g., workspace management, desk booking)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${!value ? 'border-red-300' : ''}`}
        disabled={disabled}
      />
      <p className="text-xs text-muted-foreground">
        Enter the topic area for keyword analysis
      </p>
    </div>
  );
};
