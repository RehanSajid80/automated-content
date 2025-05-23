
import { useState } from "react";

/**
 * Hook for managing persona and content goals selection
 */
export const usePersonaGoals = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>("space-planner"); // Default persona
  const [selectedGoal, setSelectedGoal] = useState<string>("increase-seo"); // Default goal
  
  return {
    selectedPersona,
    setSelectedPersona,
    selectedGoal,
    setSelectedGoal
  };
};
