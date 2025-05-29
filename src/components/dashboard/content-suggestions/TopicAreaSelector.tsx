
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { topicAreas } from "@/data/topicAreas";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TopicAreaSelectorProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  disabled?: boolean;
}

export const TopicAreaSelector: React.FC<TopicAreaSelectorProps> = ({
  selectedTopic,
  onTopicChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>🗂️ Topic Area</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Select the primary business area for your content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select
        value={selectedTopic}
        onValueChange={onTopicChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a topic area" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Topic Areas</SelectLabel>
            {topicAreas.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
