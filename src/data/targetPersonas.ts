
export interface TargetPersona {
  id: string;
  name: string;
  description: string;
}

export const targetPersonas: TargetPersona[] = [
  {
    id: "it-director",
    name: "IT Director",
    description: "Technology leaders managing workplace systems"
  },
  {
    id: "facility-manager",
    name: "Facility Manager",
    description: "Operations professionals managing physical workplace"
  },
  {
    id: "workplace-experience-lead",
    name: "Workplace Experience Lead",
    description: "Leaders focused on employee workplace experience"
  },
  {
    id: "operations-leader",
    name: "Operations Leader",
    description: "Executive overseeing operational efficiency"
  },
  {
    id: "hr-partner",
    name: "HR Partner",
    description: "Human resources professionals managing workplace culture"
  }
];
