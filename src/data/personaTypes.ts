
export interface PersonaType {
  id: string;
  name: string;
  description: string;
}

export const personaTypes: PersonaType[] = [
  {
    id: "facility-manager",
    name: "Facility Manager",
    description: "Professionals responsible for maintaining office space and facilities"
  },
  {
    id: "it-director",
    name: "IT Director",
    description: "Technology leaders managing workplace systems and infrastructure"
  },
  {
    id: "workplace-experience",
    name: "Workplace Experience Lead",
    description: "Focused on employee experience and workplace engagement"
  },
  {
    id: "operations-manager",
    name: "Operations Manager",
    description: "Oversees daily business operations and resource allocation"
  },
  {
    id: "hr-manager",
    name: "HR Manager",
    description: "Human resources professionals focused on employee workplace needs"
  }
];
