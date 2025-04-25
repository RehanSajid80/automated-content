
export interface AuthorPersona {
  id: string;
  name: string;
  role: string;
  style: string;
}

export const authorPersonas: AuthorPersona[] = [
  {
    id: "erica",
    name: "Erica Brown",
    role: "Chief People Officer",
    style: "People-focused with emphasis on workplace culture and employee experience"
  },
  {
    id: "andres",
    name: "Andres Avalos",
    role: "Chief Product Officer",
    style: "Technical and solution-oriented with product innovation focus"
  },
  {
    id: "tommy",
    name: "Tommy Coleman",
    role: "Vice President of Sales",
    style: "Results-driven with ROI emphasis and business benefits"
  },
  {
    id: "jess",
    name: "Jess Torres",
    role: "VP, Chief of Staff",
    style: "Strategic and operational with focus on implementation and best practices"
  }
];
