
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
import { marketingContentGoals } from "@/data/marketingContentGoals";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MarketingContentGoalSelectorProps {
  selectedGoal: string;
  onGoalChange: (goal: string) => void;
  disabled?: boolean;
}

export const MarketingContentGoalSelector: React.FC<MarketingContentGoalSelectorProps> = ({
  selectedGoal,
  onGoalChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>🎯 Content Goal</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Define the primary objective for this content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select
        value={selectedGoal}
        onValueChange={onGoalChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a content goal" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Content Goals</SelectLabel>
            {marketingContentGoals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>
                {goal.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
