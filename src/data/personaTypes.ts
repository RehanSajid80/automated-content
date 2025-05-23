
export interface PersonaType {
  id: string;
  name: string;
  description: string;
}

export const personaTypes: PersonaType[] = [
  {
    id: "space-planner",
    name: "Sam the Space Planner",
    description: "Focused on optimizing office layouts and space utilization"
  },
  {
    id: "facility-operator",
    name: "Farah the Facility Operator",
    description: "Manages day-to-day facility operations and maintenance"
  },
  {
    id: "decision-maker",
    name: "Danielle the Decision Maker",
    description: "Executive responsible for workplace strategy decisions"
  },
  {
    id: "it-operator",
    name: "Ishani the IT Operator",
    description: "Manages workplace technology systems and infrastructure"
  },
  {
    id: "people-planner",
    name: "Parker the People Planner",
    description: "Focuses on employee experience and workspace needs"
  },
  {
    id: "workplace-strategist",
    name: "Susie the Workplace Experience/Strategist",
    description: "Develops workplace strategy and employee experience initiatives"
  },
  {
    id: "real-estate-head",
    name: "Mike the Head of Real Estate",
    description: "Oversees real estate portfolio and workplace investments"
  }
];
