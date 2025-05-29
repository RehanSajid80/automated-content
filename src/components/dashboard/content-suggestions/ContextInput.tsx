
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ContextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ContextInput: React.FC<ContextInputProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>🧾 Context / Background</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Provide strategic context for better content suggestions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What strategic initiative or business objective is this content meant to support?"
        disabled={disabled}
        className="min-h-[100px]"
      />
    </div>
  );
};
