
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
import { FormLabel } from "@/components/ui/form";
import { contentGoals } from "@/data/contentGoals";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContentGoalSelectorProps {
  selectedGoal: string;
  onGoalChange: (goal: string) => void;
  disabled?: boolean;
}

export const ContentGoalSelector: React.FC<ContentGoalSelectorProps> = ({
  selectedGoal,
  onGoalChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FormLabel>Content Goal</FormLabel>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Define the primary objective for this content to focus suggestions</p>
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
            {contentGoals.map((goal) => (
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
