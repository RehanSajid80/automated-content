
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          id="topic-area" 
          className={`w-full ${!value ? 'border-red-300' : ''}`}
          disabled={disabled}
        >
          <SelectValue placeholder="Select a topic area" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="workspace-management">Workspace Management</SelectItem>
          <SelectItem value="office-analytics">Office Analytics</SelectItem>
          <SelectItem value="desk-booking">Desk Booking</SelectItem>
          <SelectItem value="workplace-technology">Workplace Technology</SelectItem>
          <SelectItem value="facility-management">Facility Management</SelectItem>
          <SelectItem value="asset-management">Asset Management</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select the topic area for keyword analysis
      </p>
    </div>
  );
};

