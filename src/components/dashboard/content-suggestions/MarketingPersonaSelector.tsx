
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
import { targetPersonas } from "@/data/targetPersonas";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MarketingPersonaSelectorProps {
  selectedPersona: string;
  onPersonaChange: (persona: string) => void;
  disabled?: boolean;
}

export const MarketingPersonaSelector: React.FC<MarketingPersonaSelectorProps> = ({
  selectedPersona,
  onPersonaChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>👤 Target Persona</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Select the primary audience for your content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select
        value={selectedPersona}
        onValueChange={onPersonaChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a target persona" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Target Personas</SelectLabel>
            {targetPersonas.map((persona) => (
              <SelectItem key={persona.id} value={persona.id}>
                {persona.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
