
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
import { personaTypes } from "@/data/personaTypes";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PersonaSelectorProps {
  selectedPersona: string;
  onPersonaChange: (persona: string) => void;
  disabled?: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  selectedPersona,
  onPersonaChange,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FormLabel>Target Persona</FormLabel>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Select the primary audience persona for your content to tailor suggestions</p>
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
            {personaTypes.map((persona) => (
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
